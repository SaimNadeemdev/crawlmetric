import Link from "next/link"

const DashboardNav = () => {
  return (
    <nav>
      <ul>
        <li>
          <Link href="/dashboard/main">Dashboard Home</Link>
        </li>
        <li>
          <Link href="/dashboard/profile">Profile</Link>
        </li>
        <li>
          <Link href="/dashboard/settings">Settings</Link>
        </li>
        <li>
          <Link href="/dashboard/seo-audit">SEO Audit</Link>
        </li>
        {/* Add more links as needed */}
      </ul>
    </nav>
  )
}

export default DashboardNav
