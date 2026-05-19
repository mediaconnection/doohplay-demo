import type { HTMLAttributes } from "react"

export function Card(props: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} />
}

export function CardHeader(props: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} />
}

export function CardTitle(props: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 {...props} />
}

export function CardContent(props: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} />
}