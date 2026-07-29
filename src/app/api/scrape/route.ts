import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { Scheme } from '@/lib/mock-data';

// Helper to generate a unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

export async function GET() {
  try {
    // For demonstration, we scrape the Wikipedia list of Government of India schemes
    // Real government portals (like NSP or MahaDBT) often have CAPTCHAs or block automated scraping,
    // so this demonstrates the architecture of how the scraper works.
    const url = 'https://en.wikipedia.org/wiki/List_of_schemes_of_the_government_of_India';
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    const scrapedSchemes: Scheme[] = [];

    // Wikipedia stores the schemes in wikitable classes
    $('table.wikitable tbody tr').each((index, element) => {
      // Skip the header row
      if (index === 0) return;

      const tds = $(element).find('td');
      if (tds.length >= 3) {
        const name = $(tds[0]).text().trim();
        const ministry = $(tds[1]).text().trim();
        const description = $(tds[2]).text().trim();
        
        // Skip empty rows
        if (!name || name.length < 3) return;

        // Clean up citation brackets like [1]
        const cleanName = name.replace(/\[\d+\]/g, '');
        const cleanMinistry = ministry.replace(/\[\d+\]/g, '');
        const cleanDescription = description.replace(/\[\d+\]/g, '');

        scrapedSchemes.push({
          id: `scraped_${generateId()}`,
          name: cleanName,
          nameHi: cleanName, // Placeholder for translation
          description: cleanDescription,
          ministry: cleanMinistry || 'Government of India',
          category: 'social', // Default category, would need NLP to categorize properly
          schemeType: 'central',
          schemeSource: 'government',
          targetState: null,
          benefits: 'Various government benefits as per official guidelines',
          minAge: null,
          maxAge: null,
          minIncome: null,
          maxIncome: null,
          targetGender: 'all',
          targetCategories: [],
          targetEducation: [],
          requiresBpl: false,
          requiresFarmer: cleanName.toLowerCase().includes('kisan') || cleanDescription.toLowerCase().includes('farmer'),
          requiresStudent: cleanName.toLowerCase().includes('scholarship') || cleanDescription.toLowerCase().includes('student'),
          requiresDisability: false,
          applicationUrl: 'https://www.myscheme.gov.in',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Mock deadline 30 days from now
          documentsRequired: ['Aadhaar Card', 'Bank Account'],
          isActive: true,
        });
      }
    });

    // In a real application, you would save these to a database (like Prisma/PostgreSQL) here.
    // For this demo, we just return the newly scraped schemes (limit to 10 for performance).
    
    return NextResponse.json({
      success: true,
      message: `Successfully scraped ${scrapedSchemes.length} schemes`,
      data: scrapedSchemes.slice(0, 10),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Scraping Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to scrape schemes' },
      { status: 500 }
    );
  }
}
