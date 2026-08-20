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

      const cells = $(element).find('th, td');
      if (cells.length >= 3) {
        const name = $(cells[0]).text().trim();
        const ministry = cells.length >= 3 ? $(cells[2]).text().trim() : 'Government of India';
        const sector = cells.length >= 5 ? $(cells[4]).text().trim() : '';
        const description = cells.length >= 6 
          ? $(cells[5]).text().trim() 
          : $(cells[cells.length - 1]).text().trim();
        
        // Skip empty rows and headers
        if (!name || name.length < 3 || name === 'CS/CSS' || name === 'Scheme') return;

        // Clean up citation brackets like [1]
        const cleanName = name.replace(/\[\d+\]/g, '');
        const cleanMinistry = ministry.replace(/\[\d+\]/g, '');
        const cleanDescription = description.replace(/\[\d+\]/g, '') || 'No summary available.';
        const cleanSector = sector.replace(/\[\d+\]/g, '');

        // Categorize based on keywords in name, sector, or desc
        let category = 'social';
        const lowerName = cleanName.toLowerCase();
        const lowerSector = cleanSector.toLowerCase();
        const lowerDesc = cleanDescription.toLowerCase();
        
        if (lowerName.includes('kisan') || lowerName.includes('krishi') || lowerName.includes('fashal') || lowerDesc.includes('farmer') || lowerDesc.includes('agriculture') || lowerSector.includes('agriculture')) {
          category = 'agriculture';
        } else if (lowerName.includes('scholarship') || lowerName.includes('vidya') || lowerDesc.includes('school') || lowerDesc.includes('education') || lowerDesc.includes('college') || lowerSector.includes('education')) {
          category = 'scholarship';
        } else if (lowerName.includes('swasthya') || lowerName.includes('ayushman') || lowerName.includes('bima') || lowerDesc.includes('health') || lowerDesc.includes('hospital') || lowerDesc.includes('medical') || lowerSector.includes('health')) {
          category = 'health';
        } else if (lowerName.includes('awas') || lowerName.includes('housing') || lowerDesc.includes('home') || lowerDesc.includes('house') || lowerSector.includes('housing')) {
          category = 'housing';
        } else if (lowerName.includes('kaushal') || lowerName.includes('rozgar') || lowerDesc.includes('skills') || lowerDesc.includes('employment') || lowerDesc.includes('training') || lowerSector.includes('employment')) {
          category = 'employment';
        } else if (lowerName.includes('mahila') || lowerName.includes('matru') || lowerName.includes('women') || lowerDesc.includes('girls') || lowerDesc.includes('mother') || lowerSector.includes('women')) {
          category = 'women';
        } else if (lowerName.includes('pension') || lowerName.includes('yojana') || lowerDesc.includes('welfare') || lowerSector.includes('welfare') || lowerSector.includes('social')) {
          category = 'social';
        } else if (lowerName.includes('jan dhan') || lowerName.includes('mudra') || lowerDesc.includes('finance') || lowerDesc.includes('bank') || lowerDesc.includes('subsidy') || lowerSector.includes('finance')) {
          category = 'financial';
        }

        scrapedSchemes.push({
          id: `scraped_${generateId()}`,
          name: cleanName,
          nameHi: cleanName,
          description: cleanDescription,
          ministry: cleanMinistry && cleanMinistry !== '—' ? cleanMinistry : 'Government of India',
          category,
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
          requiresFarmer: category === 'agriculture',
          requiresStudent: category === 'scholarship',
          requiresDisability: false,
          applicationUrl: 'https://www.myscheme.gov.in',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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
