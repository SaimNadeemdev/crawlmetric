"use client"

import Link from "next/link"
import { BarChart, Mail, Twitter, Facebook, Linkedin } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="bg-white border-t border-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-600 to-blue-300 flex items-center justify-center">
                <BarChart className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">CrawlMetrics</span>
            </Link>
            <p className="text-gray-500">
              Powerful SEO tools to help you track, analyze, and improve your search rankings.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-md font-medium">
              <span className="bg-gradient-to-r from-blue-600 to-blue-300 bg-clip-text text-transparent">Company</span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-md font-medium">
              <span className="bg-gradient-to-r from-blue-600 to-blue-300 bg-clip-text text-transparent">Legal</span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy-policy" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-md font-medium">
              <span className="bg-gradient-to-r from-blue-600 to-blue-300 bg-clip-text text-transparent">Connect</span>
            </h3>
            <div className="flex space-x-4">
              <Link 
                href="https://twitter.com" 
                className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <Twitter className="h-4 w-4" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link 
                href="https://facebook.com" 
                className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <Facebook className="h-4 w-4" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link 
                href="https://linkedin.com" 
                className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <Linkedin className="h-4 w-4" />
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
              <Mail className="h-4 w-4 text-gray-600" />
            </div>
            <span className="text-gray-600">support@crawlmetrics.com</span>
          </div>
          <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} CrawlMetrics. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
