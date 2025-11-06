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
    const systemPrompt = `You are adding NEW concepts to an EXISTING hierarchical concept map.

CONTEXT:
The existing map follows a clear TOP-TO-BOTTOM learning hierarchy with 3-5 levels:

- Level 1 (Top): Main concept

- Level 2: Context/Location

- Level 3: Major stages/components

- Level 4: Key mechanisms/details

- Level 5 (Bottom): Outcomes/products

Your task is to analyze the new information and determine:

1. Which new concepts should be added (if any)

2. What hierarchical level each new concept belongs to

3. How to connect them to the existing hierarchy

CRITICAL - HIERARCHICAL INTEGRATION:

IDENTIFY THE LEVEL:

For each new concept, determine which hierarchical level it belongs to:

- Is it a major component/stage? → Level 3

- Is it a supporting detail/mechanism? → Level 4

- Is it an outcome/product? → Level 5

- (Rarely add to Levels 1-2 as these are already established)

CONNECT TO THE RIGHT PARENT:

- New Level 3 nodes connect to Level 2 nodes

- New Level 4 nodes connect to Level 3 nodes (their parent stage/component)

- New Level 5 nodes connect to Level 4 nodes (what produces them)

- Avoid skip connections (Level 4 → Level 2)

MAINTAIN HIERARCHY:

- Do NOT create horizontal connections between same-level nodes

- Do NOT reconnect existing nodes to each other

- New nodes should integrate into the existing structure, not disrupt it

- Maximum 2-3 connections per new node

SIZE CONSTRAINTS:

- Add 2-5 new nodes maximum (prefer fewer, more important concepts)

- If the map already has 15+ nodes, be very selective (add 1-3 only)

- Quality over quantity - only add truly important concepts

ADDITIVE ONLY:

- You are ADDING to the map, not regenerating it

- Do NOT modify existing edges

- Do NOT reconnect existing nodes

- Preserve the existing hierarchical structure

ANALYSIS PROCESS:

Step 1: Understand the existing hierarchy

- Identify the main concept (top level)

- Identify the major components (middle levels)

- Identify the outcomes (bottom level)

Step 2: Classify new information

- What level does this new information belong to?

- Is it a new major component, a detail, or an outcome?

Step 3: Find integration points

- Which existing node is the logical parent for each new concept?

- Connect new nodes to their appropriate parent in the hierarchy

Step 4: Validate structure

- Does the addition maintain clear top-to-bottom flow?

- Are connections to the right hierarchical level?

- Is the map still clear and learnable?

EXAMPLE - Adding to Photosynthesis Map:

Existing map structure:

Level 1: Photosynthesis

Level 2: Chloroplast

Level 3: Light Reactions, Calvin Cycle

Level 4: Chlorophyll, Water, ATP, CO2

Level 5: Glucose, Oxygen

New information: "The electron transport chain in the thylakoid membrane creates a proton gradient that drives ATP synthesis"

ANALYSIS:

- "Electron Transport Chain" is a mechanism (Level 4)

- "Thylakoid" is a structure within chloroplast (Level 4)

- "Proton Gradient" is a mechanism (Level 4)

- These are details supporting "Light Reactions" (Level 3)

BAD RESPONSE (No Hierarchy):

{
  "newNodes": [
    {"id": "new-1", "label": "Electron Transport Chain", "type": "process"},
    {"id": "new-2", "label": "Thylakoid Membrane", "type": "structure"},
    {"id": "new-3", "label": "Proton Gradient", "type": "concept"},
    {"id": "new-4", "label": "ATP Synthase", "type": "enzyme"}
  ],
  "newEdges": [
    {"source": "photosynthesis", "target": "new-1", "label": "includes"},
    {"source": "new-1", "target": "new-2", "label": "occurs in"},
    {"source": "new-1", "target": "new-3", "label": "creates"},
    {"source": "new-3", "target": "atp", "label": "produces"},
    {"source": "new-4", "target": "atp", "label": "synthesizes"},
    {"source": "new-2", "target": "new-4", "label": "contains"}
  ]
}

// PROBLEMS: 
// - Too many nodes (4 when 2-3 is better)
// - Connects to wrong levels (new-1 to photosynthesis skips levels)
// - Creates complex web instead of clean hierarchy
// - 6 new edges is too many

GOOD RESPONSE (Hierarchical Integration):

{
  "newNodes": [
    {"id": "new-1", "label": "Electron Transport Chain", "type": "process"},
    {"id": "new-2", "label": "ATP Synthase", "type": "enzyme"}
  ],
  "newEdges": [
    {"source": "light-reactions", "target": "new-1", "label": "includes"},
    {"source": "new-1", "target": "new-2", "label": "powers"},
    {"source": "new-2", "target": "atp", "label": "produces"}
  ]
}

// BETTER:
// - Only 2 new nodes (focused on most important concepts)
// - Connects to Level 3 parent (Light Reactions), not top-level
// - Creates clear chain: Light Reactions → ETC → ATP Synthase → ATP
// - Only 3 new edges, clean integration
// - Maintains hierarchical flow

VALIDATION CHECKLIST:

Before returning your response, verify:

✓ Are new nodes connecting to the appropriate hierarchical level?

✓ Is the parent node at the level directly above?

✓ Are you adding 2-5 nodes maximum (ideally 2-3)?

✓ Are connections flowing downward (parent → child)?

✓ Are you avoiding skip connections across multiple levels?

✓ Would a student still understand the map's flow after this addition?

✓ Are node labels clear with context (e.g., "ATP (Energy)" not just "ATP")?

DECISION FRAMEWORK:

IF new information introduces a major new stage/component:

  → Add as Level 3, connect to Level 2

  → Example: Adding "Cyclic Photophosphorylation" as alternative pathway

IF new information is a detail about existing component:

  → Add as Level 4, connect to relevant Level 3 node

  → Example: Adding "NADP+ Reductase" under "Light Reactions"

IF new information is an outcome/product:

  → Add as Level 5, connect to Level 4 mechanism that produces it

  → Example: Adding "NADPH" as product of Light Reactions

IF new information is too granular or minor:

  → Don't add it - keep the map focused on key concepts

  → Example: Specific wavelengths of light absorbed

IF the map already has 15+ nodes:

  → Be very selective - only add if critically important

  → Consider suggesting a new topic instead

RESPONSE FORMAT:

Return JSON with:

{
  "newNodes": [
    {"id": "new-X", "label": "Concept Name (Context)", "type": "appropriate-type"}
  ],
  "newEdges": [
    {"source": "parent-node-id", "target": "new-X", "label": "relationship"}
  ]
}

Target: 2-3 new nodes, 2-4 new edges maximum

REMEMBER: 
- You're adding puzzle pieces to an existing hierarchy
- The goal is clarity, not completeness
- Each addition should enhance understanding, not complicate the map
- When in doubt, add less rather than more`;

    const prompt = `${systemPrompt}

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

IMPORTANT: 
- New node IDs should be in format: "new-1", "new-2", etc.
- When connecting to existing nodes, use their EXACT IDs from the current map
- Use appropriate node types: process, molecule, organelle, system, structure, function, enzyme, pathway, organ, tissue, cell, protein, concept
- Make sure all edges reference valid node IDs (either existing or new)

Return ONLY valid JSON in this exact format (no other text):
{
  "newNodes": [
    {"id": "new-1", "label": "Concept Name (Context)", "type": "appropriate-type"}
  ],
  "newEdges": [
    {"source": "parent-node-id", "target": "new-1", "label": "relationship"}
  ]
}`;

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

    // Validate hierarchical structure of merge
    console.log('🔍 Analyzing merge structure...');

    // Count new nodes and edges
    const newNodeCount = updateData.newNodes?.length || 0;
    const newEdgeCount = updateData.newEdges?.length || 0;

    console.log('📊 Merge Statistics:', {
      newNodes: newNodeCount,
      newEdges: newEdgeCount,
      avgConnectionsPerNode: newNodeCount > 0 ? (newEdgeCount / newNodeCount).toFixed(1) : 0
    });

    // Validate node count
    if (newNodeCount > 5) {
      console.warn('⚠️ Too many new nodes:', newNodeCount, '(should be 2-5)');
    }

    if (newNodeCount === 0) {
      console.log('ℹ️ No new nodes to add - information may already be represented');
    }

    // Validate edge count
    if (newEdgeCount > 8) {
      console.warn('⚠️ Too many new edges:', newEdgeCount, '(should be 2-8)');
    }

    // Check for same-level connections (horizontal connections are bad in hierarchy)
    const newNodeIds = new Set((updateData.newNodes as NewNode[]).map((n) => n.id));
    const existingNodeIds = new Set(currentMap.nodes.map((n) => n.id));
    const horizontalConnections = (updateData.newEdges as NewEdge[]).filter((e) => 
      newNodeIds.has(e.source) && newNodeIds.has(e.target)
    );

    if (horizontalConnections.length > 0) {
      console.warn('⚠️ Horizontal connections detected:', horizontalConnections.length);
      console.warn('   New nodes should connect to existing hierarchy, not to each other');
    }

    // Check for skip connections (edges should connect to adjacent levels)
    // This is a heuristic - we can't perfectly detect without full graph analysis
    const skipConnections = (updateData.newEdges as NewEdge[]).filter((e) => {
      // If both source and target are existing nodes, that's a reconnection (bad)
      return existingNodeIds.has(e.source) && existingNodeIds.has(e.target);
    });

    if (skipConnections.length > 0) {
      console.warn('⚠️ Reconnecting existing nodes detected:', skipConnections.length);
      console.warn('   Should only create edges from existing → new, not existing → existing');
    }

    console.log('✅ Merge validation complete');

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

