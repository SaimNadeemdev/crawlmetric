"use client"

import { startSiteAudit as serverStartSiteAudit, 
         getSiteAuditResults as serverGetSiteAuditResults,
         getSiteAuditSummary as serverGetSiteAuditSummary,
         getPagesWithIssues as serverGetPagesWithIssues } from './actions'

// Client-side wrappers for server actions
export const startSiteAudit = serverStartSiteAudit
export const getSiteAuditResults = serverGetSiteAuditResults
export const getSiteAuditSummary = serverGetSiteAuditSummary
export const getPagesWithIssues = serverGetPagesWithIssues
