import { NextResponse } from 'next/server';
import { db, isConfigValid } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { mockSchemes, calculateEligibilityScore, Scheme, UserProfile } from '@/lib/mock-data';

export async function POST(request: Request) {
  try {
    const { message, userProfile } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ success: false, error: 'Message query is required' }, { status: 400 });
    }

    // 1. Fetch schemes from Firestore or fallback to mock data
    let schemes: Scheme[] = [];
    if (isConfigValid && db) {
      try {
        const snapshot = await getDocs(collection(db, 'schemes'));
        if (!snapshot.empty) {
          schemes = snapshot.docs.map((doc) => doc.data() as Scheme);
        }
      } catch (err) {
        console.error('[Chat API] Failed to fetch schemes from Firestore, using mock-data:', err);
      }
    }
    if (schemes.length === 0) {
      schemes = mockSchemes;
    }

    const lowerQuery = message.toLowerCase();
    const activeUser = userProfile as UserProfile | null;

    let responseText = '';

    // Helper: calculate score for matched schemes if user profile exists
    const getEligibilityText = (scheme: Scheme) => {
      if (!activeUser) return '';
      const score = calculateEligibilityScore(scheme, activeUser);
      return ` (${score}% Match)`;
    };

    // 2. Simple NLP & Scheme Filtering logic
    if (lowerQuery.includes('eligible') || lowerQuery.includes('eligibility') || lowerQuery.includes('recommend')) {
      if (activeUser) {
        const eligibleSchemes = schemes
          .map((s) => ({ ...s, score: calculateEligibilityScore(s, activeUser) }))
          .filter((s) => s.score >= 50)
          .sort((a, b) => b.score - a.score);

        if (eligibleSchemes.length > 0) {
          responseText = `Based on your profile, here are the top schemes you are eligible for:\n\n` +
            eligibleSchemes.slice(0, 4).map((s) => {
              const icon = s.category === 'agriculture' ? '🌾' : s.category === 'health' ? '🏥' : s.category === 'scholarship' ? '🎓' : s.category === 'housing' ? '🏠' : '📋';
              return `${icon} **${s.name}** (${s.score}% match)\n   *Benefit:* ${s.benefits}\n`;
            }).join('\n') +
            `\nWould you like details on how to apply for any of these?`;
        } else {
          responseText = `I analyzed your profile details, but couldn't find any high-matching schemes. You might want to update your Profile details (such as occupation or income level) to unlock more matching programs!`;
        }
      } else {
        responseText = `To see a personalized list of schemes you are eligible for, please log in and fill out your profile details. Otherwise, you can check general schemes like:\n\n` +
          schemes.slice(0, 3).map((s) => `• **${s.name}**\n  *Category:* ${s.category.toUpperCase()}`).join('\n') +
          `\n\nWould you like me to explain any of these schemes?`;
      }
    } else {
      // Look for keyword-based matches
      let categoryKeyword = '';
      if (lowerQuery.includes('kisan') || lowerQuery.includes('farm') || lowerQuery.includes('agricultur') || lowerQuery.includes('crop') || lowerQuery.includes('krishi')) {
        categoryKeyword = 'agriculture';
      } else if (lowerQuery.includes('scholarship') || lowerQuery.includes('student') || lowerQuery.includes('educat') || lowerQuery.includes('school') || lowerQuery.includes('college')) {
        categoryKeyword = 'scholarship';
      } else if (lowerQuery.includes('health') || lowerQuery.includes('ayushman') || lowerQuery.includes('bima') || lowerQuery.includes('medic') || lowerQuery.includes('hospital')) {
        categoryKeyword = 'health';
      } else if (lowerQuery.includes('awas') || lowerQuery.includes('hous') || lowerQuery.includes('home') || lowerQuery.includes('urban') || lowerQuery.includes('rural')) {
        categoryKeyword = 'housing';
      } else if (lowerQuery.includes('solar') || lowerQuery.includes('electri') || lowerQuery.includes('energy') || lowerQuery.includes('surya')) {
        categoryKeyword = 'energy';
      } else if (lowerQuery.includes('pension') || lowerQuery.includes('social') || lowerQuery.includes('welfare') || lowerQuery.includes('yojana')) {
        categoryKeyword = 'social';
      } else if (lowerQuery.includes('money') || lowerQuery.includes('financial') || lowerQuery.includes('bank') || lowerQuery.includes('loan') || lowerQuery.includes('mudra')) {
        categoryKeyword = 'financial';
      }

      let matchedSchemes = schemes;
      if (categoryKeyword) {
        matchedSchemes = schemes.filter((s) => s.category === categoryKeyword || s.name.toLowerCase().includes(categoryKeyword));
      } else {
        // Direct string match on name or description
        matchedSchemes = schemes.filter(
          (s) => s.name.toLowerCase().includes(lowerQuery) || s.description.toLowerCase().includes(lowerQuery)
        );
      }

      if (matchedSchemes.length > 0) {
        const primary = matchedSchemes[0];
        const matchPct = getEligibilityText(primary);
        
        responseText = `Here is what I found regarding **${primary.name}**${matchPct}:\n\n` +
          `ℹ️ **Description:** ${primary.description}\n` +
          `💰 **Benefits:** ${primary.benefits}\n` +
          `🏛️ **Ministry:** ${primary.ministry}\n` +
          `📋 **Required Documents:** ${primary.documentsRequired.join(', ')}\n\n` +
          `🔗 **How to Apply:** You can apply online by visiting the official portal: ${primary.applicationUrl}\n\n`;

        if (matchedSchemes.length > 1) {
          responseText += `Other related schemes you might be interested in:\n` +
            matchedSchemes.slice(1, 3).map((s) => `• **${s.name}**${getEligibilityText(s)}`).join('\n');
        }
      } else {
        // Default smart fallback response
        responseText = `I searched our database for "${message}" but couldn't find a direct match.\n\n` +
          `Try asking me about:\n` +
          `• *What schemes am I eligible for?* (Loads matches based on your profile)\n` +
          `• *Explain Ayushman Bharat* or *PM Kisan*\n` +
          `• *Scholarships for students*\n` +
          `• *Housing schemes*\n\n` +
          `Let me know how else I can assist you!`;
      }
    }

    return NextResponse.json({
      success: true,
      response: responseText,
    });

  } catch (error) {
    console.error('[Chat API Error]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
