import { Link } from 'react-router-dom'

function NavLink({ to, icon: Icon, children, ...props }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center justify-center px-3 py-2 rounded-lg font-medium text-gray-700 transition-colors hover:bg-gray-100 has-[>svg]:gap-2"
      {...props}
    >
      {Icon && <Icon className="w-4 h-4" aria-hidden="true" />}
      {children}
    </Link>
  )
}

export default NavLink
