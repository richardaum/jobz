import Link from "next/link";

export function HomePage() {
  return (
    <main style={{ padding: "2rem" }}>
      <h1>Welcome to Jobz</h1>
      <p>This is a Next.js application following Feature-Sliced Design architecture.</p>
      <nav style={{ marginTop: "2rem" }}>
        <Link
          href="/about"
          style={{ color: "blue", textDecoration: "underline", marginRight: "1rem" }}
        >
          About
        </Link>
      </nav>
    </main>
  );
}
