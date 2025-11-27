import Link from "next/link";

export default function Page() {
  return (
    <main style={{ padding: "2rem" }}>
      <h1>About Jobz</h1>
      <p>This is the about page following Feature-Sliced Design architecture.</p>
      <Link href="/" style={{ color: "blue", textDecoration: "underline" }}>
        Back to Home
      </Link>
    </main>
  );
}
