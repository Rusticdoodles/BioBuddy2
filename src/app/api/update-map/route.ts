/**
 * UPDATE-MAP API ENDPOINT
 * 
 * Takes an existing concept map and new information, returns new nodes/edges to add.
 * 
 * Request body:
 * {
 *   currentMap: { nodes: [...], edges: [...] },
 *   newInformation: "Text from AI response",
 *   userMessage: "User's original request"
 * }
 * 
 * Response:
 * {
 *   newNodes: [{ id: "new-1", label: "...", type: "..." }],
 *   newEdges: [{ source: "...", target: "...", label: "..." }],
 *   success: true
 * }
 * 
 * Phase: 3b - API endpoint creation
 * Next: Phase 3c - Add confirmation UI
 */

import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

// Request/Response types
interface UpdateMapRequest {
  currentMap: {
    nodes: Array<{ id: string; data?: { label: string; type: string }; label?: string; type?: string }>;
    edges: Array<{ source: string; target: string; label: string }>;
  };
  newInformation: string;
  userMessage?: string;
  conversationContext?: unknown;
}

interface NewNode {
  id: string;
  label: string;
  type: string;
}

interface NewEdge {
  source: string;
  target: string;
  label: string;
}

interface UpdateMapResponse {
  newNodes: NewNode[];
  newEdges: NewEdge[];
  success: true;
}

// Function to get Anthropic client (lazy initialization)
const getAnthropicClient = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.includes('your_') || apiKey.includes('API_KEY')) {
    throw new Error('Anthropic API key not configured. Please add ANTHROPIC_API_KEY to your .env.local file.');
  }
  return new Anthropic({ apiKey });
};

export async function POST(req: NextRequest) {
  try {
    const anthropic = getAnthropicClient();

    const requestData: UpdateMapRequest = await req.json();
    const { currentMap, newInformation, userMessage } = requestData;

    // Validate inputs
    if (!currentMap || !currentMap.nodes || !currentMap.edges) {
      return NextResponse.json(
        { error: 'Current map is required' },
        { status: 400 }
      );
    }

    if (!newInformation) {
      return NextResponse.json(
        { error: 'New information is required' },
        { status: 400 }
      );
    }

    console.log('🔄 Updating map with new information');
    console.log('   Current nodes:', currentMap.nodes.length);
    console.log('   Current edges:', currentMap.edges.length);

    // Prepare the prompt for Claude
    const prompt = `You are adding NEW concepts to an EXISTING concept map.

CURRENT CONCEPT MAP:
Nodes (${currentMap.nodes.length}):
${JSON.stringify(currentMap.nodes.map((n) => ({ 
  id: n.id, 
  label: n.data?.label || n.label, 
  type: n.data?.type || n.type 
})), null, 2)}

Edges (${currentMap.edges.length}):
${JSON.stringify(currentMap.edges.map((e) => ({ 
  source: e.source, 
  target: e.target, 
  label: e.label 
})), null, 2)}

NEW INFORMATION FROM CONVERSATION:
${newInformation}

USER REQUEST:
"${userMessage || ''}"

YOUR TASK: Analyze the new information and determine which concepts should be added to the map and how they connect.

CRITICAL - ADDITIVE MERGE STRATEGY:
- You are ADDING to an existing map, not regenerating it
- Only create NEW nodes for concepts not already in the map
- Only create NEW edges that connect new nodes to existing nodes
- Do NOT modify or recreate existing edges
- Do NOT reconnect existing nodes to each other
- The existing structure should remain intact

CRITICAL - CONNECTION LIMITS (same as initial generation):
- Each NEW node should have 2-3 connections MAXIMUM
- Connect new nodes to the MOST relevant existing nodes only
- Avoid creating hub nodes that connect to everything
- Prioritize DIRECT relationships only
- Skip redundant connections

NEW NODE CRITERIA:
- Only add concepts that are:
  1. Explicitly mentioned in the new information
  2. Directly relevant to the user's question
  3. Not already represented in the existing map
- Aim for 2-5 new nodes maximum per merge
- If more than 5 new concepts, prioritize the most important ones

CONNECTION STRATEGY:
- Each new node should connect to 1-2 existing nodes
- Choose the most relevant existing nodes to connect to
- Avoid connecting new nodes to each other (keep them separate initially)
- Use clear relationship labels

BAD EXAMPLE (too many connections):
New info: "Substrate-level phosphorylation produces GTP"
Bad response:
{
  "newNodes": [
    {"id": "new-1", "label": "Substrate-Level Phosphorylation", "type": "process"},
    {"id": "new-2", "label": "GTP", "type": "molecule"}
  ],
  "newEdges": [
    {"source": "new-1", "target": "new-2", "label": "produces"},
    {"source": "new-1", "target": "krebs-cycle", "label": "part of"},
    {"source": "new-1", "target": "atp", "label": "similar to"},
    {"source": "new-1", "target": "energy", "label": "generates"},
    {"source": "gtp", "target": "atp", "label": "converts to"},
    {"source": "krebs-cycle", "target": "new-1", "label": "includes"}
  ]
}
// PROBLEM: 6 new edges! Too many connections. Connecting everything.

GOOD EXAMPLE (focused, clean):
New info: "Substrate-level phosphorylation produces GTP"
Good response:
{
  "newNodes": [
    {"id": "new-1", "label": "Substrate-Level Phosphorylation", "type": "process"},
    {"id": "new-2", "label": "GTP", "type": "molecule"}
  ],
  "newEdges": [
    {"source": "krebs-cycle", "target": "new-1", "label": "includes"},
    {"source": "new-1", "target": "new-2", "label": "produces"}
  ]
}
// BETTER: Only 2 edges. Clean integration. Focused relationships.

VALIDATION RULES:
- If you create more than 3 edges per new node, you're doing it wrong
- If you create edges between existing nodes, you're doing it wrong
- If you create more than 5 new nodes, you're adding too much

IMPORTANT: 
- New node IDs should be in format: "new-1", "new-2", etc.
- When connecting to existing nodes, use their EXACT IDs from the current map
- Use appropriate node types: process, molecule, organelle, system, structure, function, enzyme, pathway, organ, tissue, cell, protein, concept
- Make sure all edges reference valid node IDs (either existing or new)

Return ONLY valid JSON in this exact format (no other text):
{
  "newNodes": [
    {"id": "new-1", "label": "Concept Name", "type": "molecule"}
  ],
  "newEdges": [
    {"source": "existing-id-or-new-id", "target": "new-1", "label": "relationship"}
  ]
}

Remember: You're adding puzzle pieces to an existing picture, not redrawing the entire picture.`;

    // Call Claude
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    console.log('📥 Claude response received');

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      console.error('❌ No JSON found in Claude response');
      console.error('Response:', content);
      return NextResponse.json(
        { error: 'Failed to parse response - no JSON found' },
        { status: 500 }
      );
    }

    const updateData = JSON.parse(jsonMatch[0]) as { newNodes: unknown[]; newEdges?: unknown[] };

    // Validate the response structure
    if (!updateData.newNodes || !Array.isArray(updateData.newNodes)) {
      console.error('❌ Invalid response structure - missing newNodes array');
      return NextResponse.json(
        { error: 'Invalid response structure' },
        { status: 500 }
      );
    }

    if (!updateData.newEdges || !Array.isArray(updateData.newEdges)) {
      console.error('⚠️ Missing newEdges array, defaulting to empty array');
      updateData.newEdges = [];
    }

    // Validate response doesn't have too many connections
    const newNodeIds = new Set((updateData.newNodes as NewNode[]).map((n) => n.id));
    const existingNodeIds = new Set(currentMap.nodes.map((n) => n.id));
    const edgeCounts = new Map<string, number>();

    (updateData.newEdges as NewEdge[]).forEach((edge) => {
      // Count connections for new nodes only
      if (newNodeIds.has(edge.source)) {
        edgeCounts.set(edge.source, (edgeCounts.get(edge.source) || 0) + 1);
      }
      if (newNodeIds.has(edge.target)) {
        edgeCounts.set(edge.target, (edgeCounts.get(edge.target) || 0) + 1);
      }
    });

    const maxConnections = Math.max(...Array.from(edgeCounts.values()), 0);

    console.log('📊 Merge validation:', {
      newNodes: updateData.newNodes.length,
      newEdges: updateData.newEdges.length,
      maxConnectionsPerNewNode: maxConnections
    });

    if (maxConnections > 4) {
      console.warn('⚠️ Merge has too many connections! Max:', maxConnections);
    }

    if (updateData.newNodes.length > 6) {
      console.warn('⚠️ Merge adding too many nodes:', updateData.newNodes.length);
    }

    // Validate that new nodes have required fields
    for (const node of updateData.newNodes as NewNode[]) {
      if (!node.id || !node.label || !node.type) {
        console.error('❌ Invalid node structure:', node);
        return NextResponse.json(
          { error: 'Invalid node structure - missing required fields' },
          { status: 500 }
        );
      }
    }

    // Validate that edges reference valid nodes
    const allValidIds = new Set([...existingNodeIds, ...newNodeIds]);

    // Check for edges between existing nodes (should not happen)
    const edgesBetweenExistingNodes = (updateData.newEdges as NewEdge[]).filter(
      (edge) => existingNodeIds.has(edge.source) && existingNodeIds.has(edge.target)
    );

    if (edgesBetweenExistingNodes.length > 0) {
      console.warn('⚠️ Warning: Found edges between existing nodes (should not happen):', edgesBetweenExistingNodes.length);
      console.warn('   Edges:', edgesBetweenExistingNodes);
    }

    for (const edge of updateData.newEdges as NewEdge[]) {
      if (!allValidIds.has(edge.source) || !allValidIds.has(edge.target)) {
        console.warn('⚠️ Edge references invalid node:', edge);
        console.warn('   Valid IDs:', Array.from(allValidIds));
      }
    }

    console.log('✅ Map update data validated');
    console.log('   New nodes to add:', updateData.newNodes.length);
    console.log('   New edges to add:', updateData.newEdges.length);

    return NextResponse.json<UpdateMapResponse>({
      newNodes: updateData.newNodes as NewNode[],
      newEdges: updateData.newEdges as NewEdge[],
      success: true
    });

  } catch (error) {
    console.error('❌ Error in update-map API:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to update map',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  console.log('❌ GET method not supported for map updates');
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to update maps.' },
    { status: 405 }
  );
}

