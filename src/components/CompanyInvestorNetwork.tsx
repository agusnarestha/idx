"use client";

import { useShares } from "@/hooks/useShares";
import { ShareDataRow } from "@/types";
import * as d3 from "d3";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useMemo } from "react";

interface CompanyInvestorNetworkProps {
  readonly shareCode: string;
  readonly companyName: string;
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  fullName: string;
  type: "company" | "investor";
  percentage?: number;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}

const WIDTH = 900;
const HEIGHT = 520;
const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2;
const COMPANY_RADIUS = 44;
const INVESTOR_RADIUS = 22;
/** When there's only one investor, place them this far from the company so they don't overlap */
const SINGLE_INVESTOR_OFFSET = 220;

const COLORS = {
  companyFill: "#a855f7",
  companyStroke: "#7c3aed",
  investorFill: "#262626",
  investorStroke: "#525252",
  investorHover: "#404040",
  link: "#525252",
  linkHover: "#3b82f6",
};

export function CompanyInvestorNetwork({ shareCode, companyName }: CompanyInvestorNetworkProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const router = useRouter();

  const { data, isLoading, error } = useShares({
    shareCode,
    page: 1,
    limit: 400,
  });

  const { nodes, links, singleInvestor } = useMemo(() => {
    const rows = data?.data;
    if (rows == null || rows.length === 0) return { nodes: [] as GraphNode[], links: [] as GraphLink[], singleInvestor: false };

    const companyId = shareCode;
    const companyNode: GraphNode = {
      id: companyId,
      name: companyName.length > 20 ? companyName.slice(0, 17) + "…" : companyName,
      fullName: companyName,
      type: "company",
      fx: CENTER_X,
      fy: CENTER_Y,
    };

    const investorMap = new Map<string, { name: string; percentage: number }>();
    for (const row of rows as ShareDataRow[]) {
      const name = row.INVESTOR_NAME != null ? String(row.INVESTOR_NAME).trim() : "";
      if (name) {
        const pct = Number(row.PERCENTAGE) || 0;
        const existing = investorMap.get(name);
        if (existing === undefined || pct > existing.percentage) {
          investorMap.set(name, { name, percentage: pct });
        }
      }
    }

    const investorCount = investorMap.size;
    const investorNodes: GraphNode[] = Array.from(investorMap.entries()).map(([id, { name, percentage }]) => {
      const node: GraphNode = {
        id,
        name: name.length > 18 ? name.slice(0, 15) + "…" : name,
        fullName: name,
        type: "investor" as const,
        percentage,
      };
      // When only one investor, fix position to the right of company so they don't overlap
      if (investorCount === 1) {
        node.fx = CENTER_X + SINGLE_INVESTOR_OFFSET;
        node.fy = CENTER_Y;
      }
      return node;
    });

    const allNodes: GraphNode[] = [companyNode, ...investorNodes];
    const links: GraphLink[] = investorNodes.map((inv) => ({
      source: inv.id,
      target: companyId,
    }));

    return { nodes: allNodes, links, singleInvestor: investorCount === 1 };
  }, [data?.data, shareCode, companyName]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const container = containerRef.current;
    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.3, 3]).on("zoom", (event) => {
      g.attr("transform", event.transform);
    });
    svg.call(zoom);

    const g = svg.append("g");
    const companyNode = nodes.find((n) => n.type === "company");

    const linkDistance = singleInvestor ? SINGLE_INVESTOR_OFFSET - 20 : 130;
    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force(
        "link",
        d3
          .forceLink<GraphNode, GraphLink>(links)
          .id((d) => d.id)
          .distance(linkDistance)
      )
      .force("charge", singleInvestor ? null : d3.forceManyBody().strength(-320))
      .force("center", singleInvestor ? null : d3.forceCenter(CENTER_X, CENTER_Y))
      .force("collision", d3.forceCollide<GraphNode>().radius((d) => (d.type === "company" ? COMPANY_RADIUS + 12 : INVESTOR_RADIUS + 8)));

    const linkGroup = g.append("g").attr("class", "links");
    const linkEls = linkGroup
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("class", "link")
      .attr("stroke", COLORS.link)
      .attr("stroke-opacity", 0.5)
      .attr("stroke-width", 1.5)
      .attr("stroke-linecap", "round");

    const nodeGroup = g.append("g").attr("class", "nodes");
    const dragBehavior = d3
      .drag<SVGGElement, GraphNode>()
      .on("start", (event, d) => {
        if (d.type === "company") return;
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x ?? 0;
        d.fy = d.y ?? 0;
      })
      .on("drag", (event, d) => {
        if (d.type === "company") return;
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (d.type === "company") return;
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    const nodeEls = nodeGroup
      .selectAll<SVGGElement, GraphNode>("g.node")
      .data(nodes)
      .join("g")
      .attr("class", "node")
      .style("cursor", (d) => (d.type === "investor" ? "pointer" : "default"))
      .call(dragBehavior);

    nodeEls
      .append("circle")
      .attr("r", (d) => (d.type === "company" ? COMPANY_RADIUS : INVESTOR_RADIUS))
      .attr("fill", (d) => (d.type === "company" ? COLORS.companyFill : COLORS.investorFill))
      .attr("stroke", (d) => (d.type === "company" ? COLORS.companyStroke : COLORS.investorStroke))
      .attr("stroke-width", (d) => (d.type === "company" ? 3 : 2))
      .attr("class", "node-circle")
      .on("mouseenter", function (event, d) {
        d3.select(this).attr("fill", d.type === "company" ? "#9333ea" : COLORS.investorHover).attr("stroke-width", d.type === "company" ? 4 : 3);
        linkEls.attr("stroke-opacity", (l) => ((l.source as GraphNode).id === d.id || (l.target as GraphNode).id === d.id ? 0.9 : 0.15)).attr("stroke", (l) => ((l.source as GraphNode).id === d.id || (l.target as GraphNode).id === d.id ? COLORS.linkHover : COLORS.link));
        showTooltip(event, d);
      })
      .on("mousemove", (event) => moveTooltip(event))
      .on("mouseleave", function (_, d) {
        d3.select(this).attr("fill", d.type === "company" ? COLORS.companyFill : COLORS.investorFill).attr("stroke-width", d.type === "company" ? 3 : 2);
        linkEls.attr("stroke-opacity", 0.5).attr("stroke", COLORS.link);
        hideTooltip();
      })
      .on("click", (event, d) => {
        event.stopPropagation();
        if (d.type === "investor") router.push(`/investor/${encodeURIComponent(d.id)}`);
      });

    nodeEls
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", (d) => (d.type === "company" ? 5 : 4))
      .attr("font-size", (d) => (d.type === "company" ? 12 : 9))
      .attr("font-weight", (d) => (d.type === "company" ? 700 : 500))
      .attr("fill", "#e5e5e5")
      .attr("pointer-events", "none")
      .attr("class", "node-label")
      .text((d) => d.name);

    let tooltipEl: HTMLDivElement | null = container.querySelector("[data-network-tooltip]");
    if (!tooltipEl) {
      tooltipEl = document.createElement("div");
      tooltipEl.dataset.networkTooltip = "true";
      tooltipEl.className = "absolute z-50 pointer-events-none hidden px-3 py-2 text-sm font-medium rounded-lg shadow-lg max-w-[280px]";
      tooltipEl.style.background = "var(--card)";
      tooltipEl.style.color = "var(--text)";
      tooltipEl.style.border = "1px solid var(--border)";
      container.appendChild(tooltipEl);
    }

    function showTooltip(event: MouseEvent, d: GraphNode) {
      if (!tooltipEl) return;
      const pct = d.percentage != null ? ` · ${d.percentage.toFixed(2)}%` : "";
      tooltipEl.textContent = d.type === "company" ? d.fullName : `${d.fullName}${pct} — Click to view profile`;
      tooltipEl.classList.remove("hidden");
      moveTooltip(event);
    }
    function moveTooltip(event: MouseEvent) {
      if (tooltipEl === null || tooltipEl.classList.contains("hidden")) return;
      const padding = 12;
      const rect = container.getBoundingClientRect();
      let x = event.clientX - rect.left + padding;
      let y = event.clientY - rect.top + padding;
      if (x > rect.width / 2) x = event.clientX - rect.left - (tooltipEl.offsetWidth || 0) - padding;
      if (y > rect.height / 2) y = event.clientY - rect.top - (tooltipEl.offsetHeight || 0) - padding;
      tooltipEl.style.left = `${x}px`;
      tooltipEl.style.top = `${y}px`;
    }
    function hideTooltip() {
      tooltipEl?.classList.add("hidden");
    }

    simulation.on("tick", () => {
      if (companyNode) {
        companyNode.x = CENTER_X;
        companyNode.y = CENTER_Y;
        companyNode.fx = CENTER_X;
        companyNode.fy = CENTER_Y;
      }
      linkEls
        .attr("x1", (d) => (d.source as GraphNode).x ?? 0)
        .attr("y1", (d) => (d.source as GraphNode).y ?? 0)
        .attr("x2", (d) => (d.target as GraphNode).x ?? 0)
        .attr("y2", (d) => (d.target as GraphNode).y ?? 0);
      nodeEls.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    simulation.alpha(1).restart();

    return () => {
      simulation.stop();
      hideTooltip();
    };
  }, [nodes, links, singleInvestor, router]);

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl border border-border p-8 flex items-center justify-center min-h-[320px]">
        <p className="text-muted">Loading network…</p>
      </div>
    );
  }

  if (error || !data?.data?.length) {
    return null;
  }

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="px-8 pt-8 pb-5">
        <h3 className="text-lg font-bold text-foreground">Investor network</h3>
        <p className="text-sm text-muted mt-2">
          Relationships between this company and its shareholders. Click an investor to open their profile.
        </p>
        <div className="flex flex-wrap items-center gap-6 mt-5 text-xs text-muted">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 shrink-0 rounded-full bg-purple border-2 border-purple/80" aria-hidden />
            Company
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 shrink-0 rounded-full bg-dim border-2 border-border" aria-hidden />
            Investor
          </span>
          <span className="text-dim">Scroll to zoom · Drag to pan</span>
        </div>
      </div>
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-b-2xl bg-page border-t border-border p-6"
      >
        <svg
          ref={svgRef}
          width={WIDTH}
          height={HEIGHT}
          className="block w-full max-w-full touch-none"
          style={{ minHeight: 400, cursor: "grab" }}
        />
      </div>
    </div>
  );
}
