import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

// 简单的类名合并函数
function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

function Pagination({ className, ...props }) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

function PaginationContent({ className, ...props }) {
  return (
    <ul
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  )
}

function PaginationItem({ className, ...props }) {
  return <li className={className} {...props} />
}

function PaginationLink({ className, isActive, children, ...props }) {
  const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-9 w-9 hover:bg-gray-100"
  const activeStyles = isActive ? "border border-gray-300 bg-white" : ""
  
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      className={cn(baseStyles, activeStyles, className)}
      {...props}
    >
      {children}
    </a>
  )
}

function PaginationPrevious({ className, ...props }) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      className={cn("gap-1 px-2.5", className)}
      {...props}
    >
      <ChevronLeft className="w-4 h-4" />
      <span className="hidden sm:inline">Previous</span>
    </PaginationLink>
  )
}

function PaginationNext({ className, ...props }) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      className={cn("gap-1 px-2.5", className)}
      {...props}
    >
      <span className="hidden sm:inline">Next</span>
      <ChevronRight className="w-4 h-4" />
    </PaginationLink>
  )
}

function PaginationEllipsis({ className, ...props }) {
  return (
    <span
      aria-hidden="true"
      className={cn("flex h-9 w-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="w-4 h-4" />
      <span className="sr-only">More pages</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
