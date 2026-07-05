'use client'

import { useState } from 'react'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity/image'
import AnimateIn from '@/components/AnimateIn'

export default function TeamCard({ member, index }: { member: any; index: number }) {
  const [expanded, setExpanded] = useState(false)

  const initials = member.name
    .replace(/\[|\]/g, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()

  return (
    <AnimateIn delay={index * 90} className="flex flex-col">
      <div
        className="group flex flex-col flex-1 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        style={{ backgroundColor: '#ffffff' }}
      >
        {/* Photo area */}
        <div
          className="relative h-64 flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: '#1E3560' }}
        >
          {member.photo?.asset ? (
            <Image
              src={urlFor(member.photo).width(600).height(320).fit('crop').url()}
              alt={member.photo.alt ?? member.name}
              fill
              className="object-cover"
            />
          ) : (
            <>
              <span
                className="absolute select-none pointer-events-none font-bold"
                style={{
                  fontFamily: 'var(--font-montserrat), sans-serif',
                  fontSize: '9rem',
                  color: 'rgba(255,255,255,0.04)',
                  lineHeight: 1,
                  userSelect: 'none',
                }}
                aria-hidden
              >
                {initials}
              </span>
              <div
                className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: 'rgba(74,159,212,0.15)',
                  border: '2px solid rgba(74,159,212,0.3)',
                }}
              >
                <span
                  className="text-2xl font-bold"
                  style={{
                    color: '#4A9FD4',
                    fontFamily: 'var(--font-montserrat), sans-serif',
                  }}
                >
                  {initials}
                </span>
              </div>
              <p
                className="absolute bottom-3 text-xs font-semibold tracking-wide"
                style={{ color: 'rgba(255,255,255,0.2)' }}
              >
                Photo coming soon
              </p>
            </>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-7">
          <p
            className="text-xs font-bold tracking-[0.15em] uppercase mb-2"
            style={{ color: '#4A9FD4' }}
          >
            {member.role}
          </p>
          <h3
            className="text-lg font-bold mb-4"
            style={{
              color: '#1E3560',
              fontFamily: 'var(--font-montserrat), sans-serif',
            }}
          >
            {member.name}
          </h3>
          <p
            className="text-sm leading-relaxed"
            style={{
              color: '#2B303A',
              display: '-webkit-box',
              WebkitLineClamp: expanded ? 'unset' : 4,
              WebkitBoxOrient: 'vertical',
              overflow: expanded ? 'visible' : 'hidden',
            }}
          >
            {member.bio}
          </p>
          {member.bio?.length > 200 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-3 text-xs font-semibold self-start transition-colors duration-200 hover:opacity-70"
              style={{ color: '#4A9FD4' }}
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      </div>
    </AnimateIn>
  )
}