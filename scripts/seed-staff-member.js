#!/usr/bin/env node
'use strict'

const { createClient } = require('@sanity/client')
const fs = require('fs')
const path = require('path')

// Load .env.local so the script works without pre-setting env vars
;(function loadEnv() {
  try {
    const lines = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8').split('\n')
    for (const line of lines) {
      const t = line.trim()
      if (!t || t.startsWith('#')) continue
      const eq = t.indexOf('=')
      if (eq < 1) continue
      const k = t.slice(0, eq).trim()
      const v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
      if (k && !process.env[k]) process.env[k] = v
    }
  } catch {
    // .env.local not present — rely on existing process.env
  }
})()

// Parse --key=value flags from argv
function parseArgs() {
  const out = {}
  for (const raw of process.argv.slice(2)) {
    const stripped = raw.startsWith('--') ? raw.slice(2) : raw
    const eq = stripped.indexOf('=')
    if (eq < 1) continue
    out[stripped.slice(0, eq).trim()] = stripped.slice(eq + 1)
  }
  return out
}

async function main() {
  const {
    clerkUserId,
    fullName,
    email,
    role,
    vacationDays,
    sickDays,
    startDate,
  } = parseArgs()

  // Validate required fields
  const missing = []
  if (!clerkUserId) missing.push('--clerkUserId')
  if (!fullName)    missing.push('--fullName')
  if (!email)       missing.push('--email')
  if (!role)        missing.push('--role')

  if (missing.length) {
    console.error(`\nMissing required arguments: ${missing.join(', ')}\n`)
    printUsage()
    process.exit(1)
  }

  if (!['staff', 'owner'].includes(role)) {
    console.error(`\nInvalid role "${role}" — must be "staff" or "owner".\n`)
    process.exit(1)
  }

  const vacDays = vacationDays !== undefined ? parseInt(vacationDays, 10) : 10
  const sickDaysCount = sickDays !== undefined ? parseInt(sickDays, 10) : 5

  if (vacationDays !== undefined && isNaN(vacDays)) {
    console.error(`\nInvalid --vacationDays value "${vacationDays}" — must be a number.\n`)
    process.exit(1)
  }
  if (sickDays !== undefined && isNaN(sickDaysCount)) {
    console.error(`\nInvalid --sickDays value "${sickDays}" — must be a number.\n`)
    process.exit(1)
  }

  const token = process.env.SANITY_API_TOKEN
  if (!token) {
    console.error('\nSANITY_API_TOKEN not found. Add it to .env.local or set it in your environment.\n')
    process.exit(1)
  }

  const client = createClient({
    projectId: 'p8yox22i',
    dataset: 'production',
    token,
    apiVersion: '2024-01-01',
    useCdn: false,
  })

  // Duplicate check
  const existing = await client.fetch(
    `*[_type == "staffMember" && clerkUserId == $uid][0]{ _id, fullName, email, role }`,
    { uid: clerkUserId }
  )

  if (existing) {
    console.log('\n⚠  A staffMember already exists for that Clerk user ID:')
    console.log(`   _id:   ${existing._id}`)
    console.log(`   Name:  ${existing.fullName}`)
    console.log(`   Email: ${existing.email}`)
    console.log(`   Role:  ${existing.role}`)
    console.log('\nNo document created. Use Sanity Studio to edit the existing record.\n')
    process.exit(0)
  }

  const resolvedStartDate = startDate || new Date().toISOString().slice(0, 10)

  const doc = await client.create({
    _type: 'staffMember',
    clerkUserId,
    fullName,
    email,
    role,
    vacationDaysPerYear: vacDays,
    sickDaysPerYear: sickDaysCount,
    startDate: resolvedStartDate,
    active: true,
  })

  console.log('\n✓ Staff member created successfully')
  console.log(`  _id:             ${doc._id}`)
  console.log(`  Name:            ${fullName}`)
  console.log(`  Email:           ${email}`)
  console.log(`  Role:            ${role}`)
  console.log(`  Start date:      ${resolvedStartDate}`)
  console.log(`  Vacation days:   ${vacDays}/year`)
  console.log(`  Sick days:       ${sickDaysCount}/year`)
  console.log(`  Active:          true\n`)
}

function printUsage() {
  console.log('Usage:')
  console.log('  node scripts/seed-staff-member.js \\')
  console.log('    --clerkUserId=user_xxxx \\')
  console.log('    --fullName="Jane Smith" \\')
  console.log('    --email=jane@westerndentalacademy.com \\')
  console.log('    --role=staff \\')
  console.log('    [--vacationDays=10] \\')
  console.log('    [--sickDays=5] \\')
  console.log('    [--startDate=2026-08-16]\n')
  console.log('  role must be "staff" or "owner"')
  console.log('  vacationDays and sickDays default to 10 and 5 if omitted')
  console.log('  startDate defaults to today if omitted\n')
}

main().catch(err => {
  console.error(`\nError: ${err.message || String(err)}\n`)
  process.exit(1)
})
