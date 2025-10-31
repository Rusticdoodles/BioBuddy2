export interface GoogleImage {
  url: string;
  thumbnailUrl: string;
  title: string;
  description: string;
  pageUrl: string;
}

export async function searchGoogleImages(searchTerm: string, limit: number = 3): Promise<GoogleImage[]> {
  try {
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

    if (!apiKey || !searchEngineId) {
      console.error('Google Search API credentials not configured');
      return [];
    }

    const params = new URLSearchParams({
      key: apiKey,
      cx: searchEngineId,
      q: `${searchTerm} diagram educational`,
      searchType: 'image',
      num: limit.toString(),
      safe: 'active',
      imgSize: 'large',
    });

    const response = await fetch(`https://www.googleapis.com/customsearch/v1?${params}`);
    
    if (!response.ok) {
      console.error(`❌ Google API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Error details:', errorText.substring(0, 200));
      return [];
    }
    
    const data = await response.json();

    if (!data.items) {
      console.warn('⚠️ Google API returned no items. Response:', JSON.stringify(data).substring(0, 200));
      return [];
    }

    interface GoogleApiItem {
      link: string;
      title: string;
      snippet?: string;
      image?: {
        thumbnailLink?: string;
        contextLink?: string;
      };
    }

    return data.items.map((item: GoogleApiItem) => ({
      url: item.link,
      thumbnailUrl: item.image?.thumbnailLink || item.link,
      title: item.title,
      description: item.snippet || '',
      pageUrl: item.image?.contextLink || item.link,
    }));
  } catch (error) {
    console.error('Error fetching Google images:', error);
    return [];
  }
}

