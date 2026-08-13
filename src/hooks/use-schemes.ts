import { useState, useEffect } from 'react';
import { db, isConfigValid } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { mockSchemes, Scheme } from '@/lib/mock-data';

export function useSchemes() {
  const [schemes, setSchemes] = useState<Scheme[]>(mockSchemes);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSchemes() {
      if (isConfigValid && db) {
        try {
          const colRef = collection(db, 'schemes');
          const snapshot = await getDocs(colRef);
          if (!snapshot.empty) {
            const list: Scheme[] = [];
            snapshot.forEach((doc) => {
              list.push(doc.data() as Scheme);
            });
            setSchemes(list);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error("Failed to fetch schemes from Firestore:", err);
        }
      }
      // Fallback to static mock data if Firebase config is missing or empty
      setSchemes(mockSchemes);
      setLoading(false);
    }
    loadSchemes();
  }, []);

  return { schemes, loading };
}
