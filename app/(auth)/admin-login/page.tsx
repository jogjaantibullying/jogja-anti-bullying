"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "../../../firebase/firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";

const AdminLoginPage = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); 

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid); 
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          name: user.displayName || "Anonymous",
          email: user.email,
          profilePicture: user.photoURL || "/default-profile.png",
          role: "user", 
        });
      }

      const userData = (await getDoc(userRef)).data();
      if (userData?.role === "admin") {
        router.push("/dashboard-admin");
      } else {
        router.push("/ruang-bincang");
      }
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      setError("Terjadi kesalahan saat login dengan Google.");
    }
  };

  useEffect(() => {
    const checkUserRole = async () => {
      setLoading(true); 
      if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser?.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();

        if (userData?.role === "admin") {
          router.push("/dashboard-admin");
        } else {
          router.push("/ruang-bincang");
        }
      }
      setLoading(false);
    };

    checkUserRole();
  }, [router]);

  return (
    <div className="h-screen flex items-center">
      <div className="container mx-auto p-4">
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <>
            <h1 className="text-3xl text-center font-bold text-gray-700 mb-6">Login Admin</h1>
            <div className="flex flex-col items-center space-y-4">
              <button
                onClick={handleGoogleLogin}
                className="flex items-center justify-center shadow-md bg-white text-gray-700 px-4 py-2 rounded-full hover:bg-gray-200 space-x-2 w-full sm:max-w-xs"
              >
                <FcGoogle size={24} />
                <span>Login dengan Google</span>
              </button>

              <div>
                <p className="text-sm text-gray-300 mt-4">
                  Belum punya akun Admin?{" "}
                  <Link href="/register" className="text-blue-600 hover:underline">
                    Daftar di sini.
                  </Link>
                </p>
              </div>
            </div>
          </>
        )}

        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default AdminLoginPage;
