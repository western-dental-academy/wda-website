export default function AdminLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#F4F7F9' }}>
      <div className="text-center">
        <div
          className="w-10 h-10 rounded-full border-4 mx-auto mb-4"
          style={{
            borderColor: '#0D3B6E',
            borderTopColor: 'transparent',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p className="text-sm" style={{ color: 'rgba(30,53,96,0.5)' }}>Loading dashboard...</p>
      </div>
    </div>
  )
}
