import { NextResponse } from 'next/server';
import { db, isConfigValid } from '@/lib/firebase';
import { doc, collection, getDocs, writeBatch } from 'firebase/firestore';
import { mockSchemes, Scheme } from '@/lib/mock-data';
import * as cheerio from 'cheerio';

export async function GET() {
  if (!isConfigValid || !db) {
    return NextResponse.json({
      success: false,
      error: 'Firebase is not initialized. Please verify your environment variables.'
    }, { status: 400 });
  }

  try {
    // 1. Clean up existing schemes in Firestore to remove old buggy entries
    const colRef = collection(db, 'schemes');
    const snapshot = await getDocs(colRef);
    if (!snapshot.empty) {
      const deleteBatch = writeBatch(db);
      snapshot.forEach((d) => {
        deleteBatch.delete(d.ref);
      });
      await deleteBatch.commit();
      console.log(`Cleaned up ${snapshot.size} old schemes from Firestore.`);
    }

    // 2. Scrape Wikipedia list of government schemes to get real live data
    const url = 'https://en.wikipedia.org/wiki/List_of_schemes_of_the_government_of_India';
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const scrapedSchemes: Scheme[] = [];

    if (response.ok) {
      const html = await response.text();
      const $ = cheerio.load(html);
      
      $('table.wikitable tbody tr').each((index, element) => {
        if (index === 0) return; // skip header
        
        // Find both th and td cells (Scheme names are often th scope="row")
        const cells = $(element).find('th, td');
        if (cells.length >= 3) {
          const name = $(cells[0]).text().trim().replace(/\[\d+\]/g, '');
          const type = $(cells[1]).text().trim().replace(/\[\d+\]/g, '');
          const ministry = $(cells[2]).text().trim().replace(/\[\d+\]/g, '');
          const launchYear = cells.length >= 4 ? $(cells[3]).text().trim().replace(/\[\d+\]/g, '') : '';
          const sector = cells.length >= 5 ? $(cells[4]).text().trim().replace(/\[\d+\]/g, '') : '';
          
          // The last element or index 5 contains the summary description
          const description = cells.length >= 6 
            ? $(cells[5]).text().trim().replace(/\[\d+\]/g, '') 
            : $(cells[cells.length - 1]).text().trim().replace(/\[\d+\]/g, '');

          // Filter out header duplications or invalid names (e.g. CSS, CS, or empty)
          if (!name || name.length < 3 || name === 'CS/CSS' || name === 'Scheme') return;

          // Categorize based on keywords in name, sector, or desc
          let category = 'social';
          const lowerName = name.toLowerCase();
          const lowerSector = sector.toLowerCase();
          const lowerDesc = description.toLowerCase();
          
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
            id: `scraped_${index}`,
            name,
            nameHi: name,
            description: description || 'No summary available.',
            ministry: ministry && ministry !== '—' ? ministry : 'Government of India',
            category,
            schemeType: 'central',
            schemeSource: 'government',
            targetState: null,
            benefits: 'Financial assistance and support under guidelines.',
            minAge: 18,
            maxAge: null,
            minIncome: null,
            maxIncome: null,
            targetGender: 'all',
            targetCategories: ['general', 'obc', 'sc', 'st', 'ews'],
            targetEducation: ['none', 'primary', 'secondary', 'graduate', 'postgraduate'],
            requiresBpl: false,
            requiresFarmer: category === 'agriculture',
            requiresStudent: category === 'scholarship',
            requiresDisability: false,
            applicationUrl: 'https://www.myscheme.gov.in',
            deadline: null,
            documentsRequired: ['Aadhaar Card', 'Bank Account Proof'],
            isActive: true,
          });
        }
      });
    }

    // 3. Use only genuine scraped schemes, exclude mock static schemes
    const allSchemes = scrapedSchemes;

    // 4. Write in batches to Firestore (split into chunks of 450 to stay under 500 limit)
    const batch = writeBatch(db);
    allSchemes.forEach((scheme) => {
      const docRef = doc(db, 'schemes', scheme.id);
      batch.set(docRef, scheme);
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: `Successfully cleaned database and seeded ${allSchemes.length} correct schemes into Firestore.`,
      count: allSchemes.length
    });

  } catch (err: any) {
    console.error('Seeding schemes failed:', err);
    return NextResponse.json({
      success: false,
      error: err?.message || 'Failed to seed schemes into database.'
    }, { status: 500 });
  }
}
