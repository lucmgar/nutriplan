'use client';

import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, deleteDoc, doc, getFirestore } from 'firebase/firestore';
import { app } from '../../../firebase';

const auth = getAuth(app);
const db = getFirestore(app);

export default function Grocery() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchList = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const querySnapshot = await getDocs(collection(db, `users/${user.uid}/shoppinglist`));
    const items = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setList(items);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    const user = auth.currentUser;
    if (!user) return;

    await deleteDoc(doc(db, `users/${user.uid}/shoppinglist/${id}`));
    fetchList(); // Refresh
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="p-8 text-white bg-black min-h-screen">
      <h1 className="text-3xl font-bold mb-4">🛒 Shopping List</h1>
      {loading && <p>Loading...</p>}
      {!loading && list.length === 0 && <p>No items in shopping list.</p>}
      <ul className="space-y-4">
        {list.map((item) => (
          <li key={item.id} className="bg-neutral-800 p-4 rounded border border-neutral-700">
            <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
            <ul className="list-disc pl-5 text-sm mb-2">
              {item.ingredients.map((i, idx) => (
                <li key={idx}>{i.original || i.name}</li>
              ))}
            </ul>
            <button
              onClick={() => handleDelete(item.id)}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
