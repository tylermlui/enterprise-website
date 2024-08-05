'use client'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { collection, addDoc, deleteDoc, getDocs, doc, query, where, onSnapshot } from "firebase/firestore"; 
import React, { useState, useEffect, useCallback } from 'react';
import { db, storage } from './firebase';
import { ref } from 'firebase/storage'
import debounce from 'lodash.debounce';

export default function Home() {
  const [items, setItems] = useState([]);
  const [searchList, setSearch] = useState([]);
  const [nameSearch, setSearchItem] = useState("");
  const [newItem, setNewItem] = useState({ name: '', price: '' });
  const [total, setTotal] = useState(0);
  const [searched, setSearched] = useState(false);
  const [filterType, setFilter] = useState("");
  const [imageSrc, setImageSrc] = useState("");
  const [src, setSrc] = useState(''); // initial src will be empty

  const addItem = async (e) => {
    e.preventDefault();
    if (newItem.name !== '' && newItem.price !== '') {
      await addDoc(collection(db, 'items'), {
        name: newItem.name.trim(),
        price: parseFloat(newItem.price),
      });
      setNewItem({ name: '', price: '' });
    }
  };

  const deleteItem = useCallback(async (id) => {
    if (id) {
      await deleteDoc(doc(db, 'items', id));
    }
  }, []);

  const deleteSearch = useCallback(async (id) => {
    if (id) {
      deleteItem(id);
      const updatedSearchList = searchList.filter(item => item.id !== id);
      setSearch(updatedSearchList);
    }
  }, [searchList, deleteItem]);

  const searchItem = async (searchValue) => {
    setSearched(false); // Reset the searched state before performing a new search
    setSearch([]); // Clear the search results before performing a new search
    if (searchValue !== '') {
      const q = query(collection(db, 'items'), where("name", "==", searchValue));
      const querySnapshot = await getDocs(q);
      const searchResults = [];
      querySnapshot.forEach((doc) => {
        searchResults.push({ ...doc.data(), id: doc.id });
      });
      setSearch(searchResults);
      setSearched(true); // Update the searched state after the search is performed
    }
  };

  const debouncedSearch = useCallback(debounce(searchItem, 300), []);

  const filterItem = (type) => {
    let sortedItems = [...items];

    if (type === "alphabetical") {
      sortedItems.sort((a, b) => a.name.localeCompare(b.name));
    } else if (type === "reverse") {
      sortedItems.sort((a, b) => b.name.localeCompare(a.name));
    } else if (type === "ascending") {
      sortedItems.sort((a, b) => a.price - b.price);
    } else if (type === "descending") {
      sortedItems.sort((a, b) => b.price - a.price);
    }

    setItems(sortedItems);
    setFilter(type);
  };

  useEffect(() => {
    const q = query(collection(db, 'items'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const itemsArr = [];
      querySnapshot.forEach((doc) => {
        itemsArr.push({ ...doc.data(), id: doc.id });
      });
      setItems(itemsArr);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (items.length > 0) {
      const totalAmount = items.reduce((acc, item) => acc + item.price, 0);
      setTotal(totalAmount);
    }
  }, [items]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between sm:p-24 p-4">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl p-4 text-center font-bold">Pantry Tracker</h1>
        <div className='bg-gray-200 p-4 rounded-lg'>
          <form className='grid grid-cols-6 items-center text-black' onSubmit={addItem}>
            <input
              value={nameSearch}
              onChange={e => {
                setSearchItem(e.target.value);
                debouncedSearch(e.target.value);
              }}
              className="p-3 mb-2 col-span-5 mr-3 text-black rounded-lg"
              type="text"
              placeholder="Search Item"
            />
            <Popover>
              <PopoverButton className="block mx-auto px-10 py-2 mb-2 text-sm/6 font-semibold text-white bg-slate-500 rounded-md">
                Filter
              </PopoverButton>
              <PopoverPanel
                transition
                anchor="bottom"
                className=" bg-black bg-opacity-90 rounded-lg z-10 "
              >
                <div className="p-3">
                  <a className="block rounded-lg py-2 px-3 transition hover:bg-white/5">
                    <button
                      className='font-semibold text-white'
                      type="button" // Use type="button" instead of "submit" for filter button
                      onClick={() => filterItem("alphabetical")}
                    >Sort A-Z</button>
                  </a>
                  <a className="block rounded-lg py-2 px-3 transition hover:bg-white/5">
                    <button
                      className='font-semibold text-white'
                      type="button" // Use type="button" instead of "submit" for filter button
                      onClick={() => filterItem("reverse")}
                    >Sort Z-A</button>
                  </a>
                  <a className="block rounded-lg py-2 px-3 transition hover:bg-white/5">
                    <button
                      className='font-semibold text-white'
                      type="button" // Use type="button" instead of "submit" for filter button
                      onClick={() => filterItem("ascending")}
                    >Ascending</button>
                  </a>
                  <a className="block rounded-lg py-2 px-3 transition hover:bg-white/5">
                    <button
                      className='font-semibold text-white'
                      type="button" // Use type="button" instead of "submit" for filter button
                      onClick={() => filterItem("descending")}
                    >Descending</button>
                  </a>
                </div>
              </PopoverPanel>
            </Popover>
            <input
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="col-span-3 p-3 border rounded-lg"
              type="text"
              placeholder="Enter Item"
            />
            <input
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              className="col-span-2 p-3 border mx-3 rounded-lg"
              type="number"
              placeholder="Enter Amount"
            />
            <button className='text-white bg-slate-950 hover:bg-slate-900 p-2 text-xl rounded-md' type="submit">+</button>
          </form>
          {searched ? (
            <>
              {searchList.length === 0 ? (
                <div className='text-black text-xl text-center mt-5'>No items found</div>
              ) : (
                <ul>
                  {searchList.map((item) => (
                    <li key={item.id} className='my-4 w-full flex justify-between bg-slate-950 rounded-lg'>
                      <div className='p-4 w-full flex justify-between'>
                        <span className='capitalize'>{item.name}</span>
                        <span>{item.price}</span>
                      </div>
                      <button onClick={() => deleteSearch(item.id)} className='ml-8 p-4 border-l-2 border-slate-900 hover:bg-slate-900 w-16 rounded-lg'>X</button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <ul>
              {items.map((item) => (
                <li key={item.id} className='my-4 w-full flex justify-between bg-slate-950 rounded-lg'>
                  <div className='p-4 w-full flex justify-between'>
                    <span className='capitalize'>{item.name}</span>
                    <span>{item.price}</span>
                  </div>
                  <button onClick={() => deleteItem(item.id)} className='ml-8 p-4 border-l-2 border-slate-900 hover:bg-slate-900 w-16 rounded-lg'>x</button>
                </li>
              ))}
            </ul>
          )}
          {items.length < 1 ? (" ") : (
            <div className='flex justify-between p-3 text-black'>
              <span>Total</span>
              <span>${total}</span>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
