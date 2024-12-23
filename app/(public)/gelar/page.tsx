"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import Image from "next/image";
import PostCard from "../../../components/PostCard";
import Modal from "../../../components/ui/Modal"; 
import GelarPostForm from "../../../components/GelarPostForm";

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  imageUrl: string;
  createdAt: { seconds: number };
  likes: number;
  approved?: boolean; 
}

export default function GelarPelajar() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [showModal, setShowModal] = useState(false); 

  const fetchPosts = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "gelarPosts"));
      const postsData: Post[] = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((post) => 'approved' in post && post.approved === true) as Post[]; 

      setPosts(postsData);
    } catch (error) {
      console.error("Error fetching posts: ", error);
      alert("Error fetching posts. Periksa pengaturan Firestore.");
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const optimizedPosts = useMemo(() => posts, [posts]);

  const toggleModal = () => {
    setShowModal((prev) => !prev);
  };
  

  return (
    <div className="min-h-screen">
      <header className="bg-bluetiful text-white pt-10 text-center">
        <div className="flex justify-center items-center">
          <Image
            src="/gelar-pelajar.png"
            width={720}
            height={720}
            alt="Gelar Pelajar"
            className="w-72 h-80"
            priority
          />
        </div>
        <h1 className="text-4xl font-bold mt-4">Gelar Pelajar</h1>
        <p className="text-lg mt-2">
          Wahana ekspresi potensi berbasis Multiple Intelligence untuk merealisasikan minat, bakat, dan kreativitas pelajar.
        </p>

        <button
          className="mt-6 px-6 py-3 bg-white text-bluetiful font-semibold rounded-full shadow-lg hover:bg-bluetiful hover:text-white transition"
          onClick={toggleModal}
        >
          Unggah GelarPost
        </button>

        <div className="w-full mt-8">
          <Image src="/batik.png" width={720} height={720} alt="batik" className="w-full" />
        </div>
      </header>

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {optimizedPosts.map((post) => (
            <PostCard
              key={post.id}
              id={post.id}
              title={post.title}
              content={post.content}
              category={post.category}
              imageUrl={post.imageUrl}
              createdAt={post.createdAt?.seconds || Date.now() / 1000}
              likes={post.likes}
              isAdmin={false}
            />
          ))}
        </div>
      </div>

      {showModal && (
        <Modal onClose={toggleModal}>
          <GelarPostForm onClose={toggleModal} />
        </Modal>
      )}
    </div>
  );
}
