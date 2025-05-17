
"use client";

import { useState } from 'react';
import type { BookSummary } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Share2, AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLanguage } from '@/contexts/language-context';
import { generateKeyTakeaways, type GenerateKeyTakeawaysOutput } from '@/ai/flows/generate-key-takeaways-flow';
import { generateConceptMap, type GenerateConceptMapOutput, type GenerateConceptMapInput } from '@/ai/flows/generate-concept-map-flow';

interface ConceptMapGeneratorProps {
  summary: BookSummary;
}

// Get the type of a single node object from the array
type InferredNode = GenerateConceptMapOutput['nodes'][number];
// Add layout properties
type NodeData = InferredNode & {
  x: number;
  y: number;
};

// Get the type of a single edge object from the array
type EdgeData = GenerateConceptMapOutput['edges'][number];


export function ConceptMapGenerator({ summary }: ConceptMapGeneratorProps) {
  const [takeaways, setTakeaways] = useState<string[] | null>(null);
  const [conceptMapData, setConceptMapData] = useState<GenerateConceptMapOutput | null>(null);
  const [isLoadingTakeaways, setIsLoadingTakeaways] = useState(false);
  const [isLoadingMap, setIsLoadingMap] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const { language, t } = useLanguage();

  const SVG_WIDTH = 600;
  const SVG_HEIGHT = 400;
  const NODE_RADIUS = 40;

  const handleGenerateMap = async () => {
    setIsLoadingTakeaways(true);
    setError(null);
    setTakeaways(null);
    setConceptMapData(null);

    try {
      const takeawaysResult: GenerateKeyTakeawaysOutput = await generateKeyTakeaways({ summaryContent: summary.content.en });
      setTakeaways(takeawaysResult.takeaways);
      setIsLoadingTakeaways(false);

      if (takeawaysResult.takeaways && takeawaysResult.takeaways.length > 0) {
        setIsLoadingMap(true);
        const mapInput: GenerateConceptMapInput = { takeaways: takeawaysResult.takeaways };
        const mapResult: GenerateConceptMapOutput = await generateConceptMap(mapInput);
        setConceptMapData(mapResult);
        setIsLoadingMap(false);
      } else {
        setError(t('errorNoTakeawaysForMap'));
      }
    } catch (err) {
      console.error("Error generating concept map:", err);
      setError(t('errorGeneratingConceptMap'));
      setIsLoadingTakeaways(false);
      setIsLoadingMap(false);
    }
  };

  const layoutNodes = (nodes: GenerateConceptMapOutput['nodes']): NodeData[] => {
    if (!nodes || nodes.length === 0) return [];
    const numNodes = nodes.length;
    const centerX = SVG_WIDTH / 2;
    const centerY = SVG_HEIGHT / 2;
    const radius = Math.min(SVG_WIDTH, SVG_HEIGHT) / 2 - NODE_RADIUS - 30; // 30 for padding

    return nodes.map((node, index) => {
      if (numNodes === 1) return { ...node, x: centerX, y: centerY };
      const angle = (index / numNodes) * 2 * Math.PI - (Math.PI / 2); // Start from top
      return {
        ...node,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });
  };

  const laidOutNodes = conceptMapData ? layoutNodes(conceptMapData.nodes) : [];
  const nodeMap = new Map(laidOutNodes.map(node => [node.id, node]));

  const isLoading = isLoadingTakeaways || isLoadingMap;

  return (
    <Card className="mt-8 shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <Share2 className="mr-3 h-6 w-6 text-primary" />
          {t('conceptMapTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          {t('conceptMapIntro', { title: summary.title[language] || summary.title.en })}
        </p>
        
        {!conceptMapData && !isLoading && (
           <Button onClick={handleGenerateMap} disabled={isLoading} size="lg">
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Share2 className="mr-2 h-5 w-5" />
            )}
            {t('generateConceptMap')}
          </Button>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-3 text-muted-foreground">
              {isLoadingTakeaways ? t('loadingTakeaways') : t('loadingConceptMap')}
            </p>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="my-4">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>{t('errorGeneratingTitle')}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {conceptMapData && !isLoading && (
          <div className="mt-4 space-y-4">
            {conceptMapData.nodes.length === 0 && <p>{t('noConceptsFound')}</p>}
            {conceptMapData.nodes.length > 0 && (
              <div className="border rounded-lg p-2 bg-card overflow-auto">
                <svg width={SVG_WIDTH} height={SVG_HEIGHT} viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}>
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="0"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--muted-foreground))" />
                    </marker>
                  </defs>

                  {/* Edges - Rendered first so nodes appear on top */}
                  {conceptMapData.edges.map((edge: EdgeData, index: number) => {
                    const sourceNode = nodeMap.get(edge.source);
                    const targetNode = nodeMap.get(edge.target);
                    if (!sourceNode || !targetNode) return null;

                    const dx = targetNode.x - sourceNode.x;
                    const dy = targetNode.y - sourceNode.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist === 0) return null; 
                    
                    const unitDx = dx / dist;
                    const unitDy = dy / dist;
                    // Line ends at the edge of the node circle, plus a small gap for the arrowhead
                    const lineEndX = targetNode.x - unitDx * (NODE_RADIUS + 2); 
                    const lineEndY = targetNode.y - unitDy * (NODE_RADIUS + 2);

                    return (
                      <g key={`edge-${index}`}>
                        <line
                          x1={sourceNode.x}
                          y1={sourceNode.y}
                          x2={lineEndX}
                          y2={lineEndY}
                          stroke="hsl(var(--muted-foreground))"
                          strokeWidth="1.5"
                          markerEnd="url(#arrowhead)"
                        />
                        {edge.label && (
                          <text
                            x={(sourceNode.x + targetNode.x) / 2}
                            y={(sourceNode.y + targetNode.y) / 2}
                            fill="hsl(var(--foreground))"
                            fontSize="10"
                            textAnchor="middle"
                            dy="-3" // Shift text slightly above the line
                          >
                            {edge.label}
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* Nodes - Rendered after edges */}
                  {laidOutNodes.map((node) => (
                    <g 
                      key={node.id} 
                      transform={`translate(${node.x}, ${node.y})`} 
                      onClick={() => setSelectedNode(node)}
                      className="cursor-pointer group"
                    >
                      <circle 
                        r={NODE_RADIUS} 
                        fill="hsl(var(--card))" // Opaque fill
                        stroke="hsl(var(--primary))" 
                        strokeWidth="2"
                        className="group-hover:fill-primary/20 transition-colors" // Translucent on hover
                      />
                      <text
                        textAnchor="middle"
                        dy=".3em" // Vertical alignment
                        fontSize="10"
                        fill="hsl(var(--card-foreground))" // Text color for contrast with card fill
                        className="pointer-events-none select-none"
                      >
                        {node.label.length > 12 ? node.label.substring(0, 9) + "..." : node.label}
                      </text>
                    </g>
                  ))}
                </svg>
                 <p className="text-xs text-muted-foreground mt-2 italic">{t('conceptMapDisclaimer')}</p>
              </div>
            )}
             <Button onClick={handleGenerateMap} variant="outline" className="mt-4">
                <Share2 className="mr-2 h-4 w-4" />
                {t('regenerateConceptMap')}
            </Button>
          </div>
        )}

        {selectedNode && (
          <Dialog open={!!selectedNode} onOpenChange={(open) => !open && setSelectedNode(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center">
                    <Info className="mr-2 h-5 w-5 text-primary"/>
                    {selectedNode.label}
                </DialogTitle>
                <DialogDescription className="pt-2 text-foreground/80">
                  {selectedNode.explanation}
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}
