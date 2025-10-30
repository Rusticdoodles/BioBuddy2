export interface WikimediaImage {
  url: string;
  thumbnailUrl: string;
  title: string;
  description: string;
  pageUrl: string;
}

export async function searchWikimediaImages(searchTerm: string, limit: number = 3): Promise<WikimediaImage[]> {
  try {
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      generator: 'search',
      gsrsearch: searchTerm,
      gsrnamespace: '6',
      gsrlimit: limit.toString(),
      prop: 'imageinfo',
      iiprop: 'url|extmetadata|size',
      iiurlwidth: '300',
      origin: '*'
    });

    const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`);
    const data = await response.json();

    if (!data.query || !data.query.pages) {
      return [];
    }

    const images: WikimediaImage[] = [];
    for (const pageId in data.query.pages) {
      const page = data.query.pages[pageId];
      if (page.imageinfo && page.imageinfo[0]) {
        const imageInfo = page.imageinfo[0];
        const metadata = imageInfo.extmetadata || {};
        images.push({
          url: imageInfo.url,
          thumbnailUrl: imageInfo.thumburl || imageInfo.url,
          title: page.title.replace('File:', ''),
          description: metadata.ImageDescription?.value || metadata.ObjectName?.value || '',
          pageUrl: `https://commons.wikimedia.org/wiki/${page.title}`
        });
      }
    }

    return images;
  } catch (error) {
    console.error('Error fetching Wikimedia images:', error);
    return [];
  }
}

export function extractKeywords(text: string): string[] {
  // Common stop words to filter out
  const commonWords = new Set([
    'the', 'is', 'are', 'was', 'were', 'a', 'an', 'and', 'or', 'but', 
    'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'this', 
    'that', 'these', 'those', 'has', 'have', 'had', 'been', 'being'
  ]);

  // Biological/biochemical term indicators (common prefixes, suffixes, and root words)
  const biologicalIndicators = new Set([
    'cell', 'dna', 'rna', 'protein', 'enzyme', 'molecule', 'organelle',
    'tissue', 'organ', 'system', 'pathway', 'gene', 'chromosome',
    'membrane', 'nucleus', 'mitochondria', 'chloroplast', 'ribosome',
    'synthesis', 'replication', 'transcription', 'translation', 'metabolism',
    'atp', 'glucose', 'photosynthesis', 'respiration', 'mitosis', 'meiosis',
    'amino', 'acid', 'base', 'nucleotide', 'protein', 'lipid', 'carbohydrate',
    'hormone', 'receptor', 'antibody', 'antigen', 'virus', 'bacteria',
    'structure', 'function', 'process', 'mechanism', 'regulation'
  ]);

  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word));

  // Extract 2-word phrases and filter for biological relevance
  const phrases: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    const word1 = words[i];
    const word2 = words[i + 1];
    const phrase = `${word1} ${word2}`;
    
    // Check if phrase contains biological indicators
    const isBiologicalPhrase = 
      biologicalIndicators.has(word1) || 
      biologicalIndicators.has(word2) ||
      biologicalIndicators.has(word1.slice(0, -1)) || // Handle plurals
      biologicalIndicators.has(word2.slice(0, -1)) ||
      // Check for common biological phrase patterns
      phrase.includes('cell ') ||
      phrase.includes(' dna') ||
      phrase.includes(' rna') ||
      phrase.includes('protein ') ||
      phrase.includes('enzyme ') ||
      phrase.includes('molecule ') ||
      phrase.includes(' synthesis') ||
      phrase.includes(' pathway') ||
      phrase.includes(' reaction') ||
      phrase.includes(' process') ||
      phrase.includes(' mechanism');

    if (isBiologicalPhrase) {
      phrases.push(phrase);
    }
  }

  // Combine single words and phrases, boost biological terms
  const allTerms = [...words, ...phrases];
  const termCount = new Map<string, number>();
  
  allTerms.forEach(term => {
    const baseCount = termCount.get(term) || 0;
    // Boost biological terms (single words or phrases)
    const isBiological = 
      biologicalIndicators.has(term) ||
      biologicalIndicators.has(term.split(' ')[0]) ||
      biologicalIndicators.has(term.split(' ')[1]) ||
      term.split(' ').some(word => biologicalIndicators.has(word));
    
    // Multi-word phrases get higher priority
    const isPhrase = term.includes(' ');
    const boost = isBiological ? 2 : 1;
    const phraseBoost = isPhrase ? 1.5 : 1;
    
    termCount.set(term, baseCount + boost * phraseBoost);
  });

  const topTerms = Array.from(termCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(entry => entry[0]);
  
  return topTerms;
}


