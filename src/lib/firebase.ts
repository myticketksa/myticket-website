/**
 * Firebase, only for Google sign-in (25 Oct 2026). Project my-ticket-88c95,
 * web app "MyTicket Website". These values are public by design — they name
 * the project; what a signed-in person can do is decided by the API, which
 * checks the Firebase ID token itself (POST /auth/login/firebase).
 * Loaded on first use so the SDK stays out of the main bundle.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "AIzaSyC6gp2aiG3GAShwBWnhnliRvFv8QsxEcQQ",
  authDomain: "my-ticket-88c95.firebaseapp.com",
  projectId: "my-ticket-88c95",
  appId: "1:992918522930:web:d69f36cb7ebdade8d2002b",
};

/**
 * Opens Google's account picker and returns a Firebase ID token for the
 * account chosen, or null when the person closes the window. The Firebase
 * session is dropped straight away — the API session is the one the site keeps.
 */
export async function googleIdToken(): Promise<string | null> {
  const [{ initializeApp, getApps }, auth] = await Promise.all([
    import("firebase/app"),
    import("firebase/auth"),
  ]);
  const app = getApps()[0] ?? initializeApp(firebaseConfig);
  const firebaseAuth = auth.getAuth(app);
  const provider = new auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  try {
    const result = await auth.signInWithPopup(firebaseAuth, provider);
    return await result.user.getIdToken();
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
      return null;
    }
    throw error;
  } finally {
    auth.signOut(firebaseAuth).catch(() => {});
  }
}
