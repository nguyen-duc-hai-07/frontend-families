import React, { memo } from 'react'
import type { PersonTreeNode } from '@/types'
import { PersonCard } from './PersonCard'

interface TreeNodeItemProps {
  node: PersonTreeNode
  isRoot?: boolean
  collapsedNodeIds: Set<number>
  highlightedPersonId: number | null
  onToggleCollapse: (id: number) => void
  onSelectPerson: (id: number) => void
}

export const TreeNodeItem = memo(function TreeNodeItem({
  node,
  isRoot = false,
  collapsedNodeIds,
  highlightedPersonId,
  onToggleCollapse,
  onSelectPerson,
}: TreeNodeItemProps) {
  const hasChildren = Boolean(node.children && node.children.length > 0)
  const isCollapsed = collapsedNodeIds.has(node.id)
  const isHighlighted = highlightedPersonId === node.id

  return (
    <li className="tree-node">
      <PersonCard
        node={node}
        isRoot={isRoot}
        isCollapsed={isCollapsed}
        isHighlighted={isHighlighted}
        hasChildren={hasChildren}
        childCount={node.children?.length || 0}
        onToggleCollapse={onToggleCollapse}
        onSelectPerson={onSelectPerson}
      />

      {hasChildren && !isCollapsed && (
        <ul className="tree-children">
          {node.children.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              isRoot={false}
              collapsedNodeIds={collapsedNodeIds}
              highlightedPersonId={highlightedPersonId}
              onToggleCollapse={onToggleCollapse}
              onSelectPerson={onSelectPerson}
            />
          ))}
        </ul>
      )}
    </li>
  )
})
