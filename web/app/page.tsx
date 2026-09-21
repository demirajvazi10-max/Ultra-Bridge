import {Chat} from '@/components/Chat'

export default function Home() {
  return (
    <>
      <header className="site-header">
        <h1>Ultra Bridge</h1>
        <p className="lead">
          Find, compare and translate JAWS and NVDA keyboard commands. Every answer comes from structured data with a
          stated level of verification.
        </p>
      </header>
      <main id="main" tabIndex={-1}>
        <Chat />
        <section aria-labelledby="about-heading" className="card">
          <h2 id="about-heading">About the data</h2>
          <p>
            Ultra Bridge does not guess keys. Each command is a document in a Sanity dataset that points to a shared
            action, so JAWS and NVDA equivalents are found through that action. That is why it can answer questions
            such as which keys do different jobs in the two screen readers, or which JAWS commands have no default NVDA
            equivalent.
          </p>
          <p>Each command carries one of five verification levels.</p>
          <ul>
            <li>Tested by author: confirmed by pressing the keys on a real screen reader.</li>
            <li>Cross-checked: two or more sources agree.</li>
            <li>First-party: one document from Freedom Scientific or NV Access.</li>
            <li>Third-party: one page from someone else, such as Deque University.</li>
            <li>Recalled: not confirmed in a source yet. Check it with input help before relying on it.</li>
          </ul>
          <p>
            Part of the Ultra suite of accessible software by Demir Ajvazi. Built for the DEV Sanity Challenge.
          </p>
        </section>
      </main>
    </>
  )
}
