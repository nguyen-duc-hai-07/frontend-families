import React, { useState } from 'react'
import { Modal, Button } from '@/components/ui'
import type { PersonTreeNode } from '@/types'
import { useToast } from '@/hooks/useToast'

interface TreeImportExportModalProps {
  isOpen: boolean
  onClose: () => void
  treeData: PersonTreeNode[]
  familyName?: string
  svgRef?: React.RefObject<SVGSVGElement | null>
}

export function TreeImportExportModal({
  isOpen,
  onClose,
  treeData,
  familyName = 'gia-pha',
  svgRef,
}: TreeImportExportModalProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<'EXPORT' | 'IMPORT'>('EXPORT')
  const [jsonText, setJsonText] = useState('')

  // Export JSON file
  const handleExportJson = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(treeData, null, 2))
      const downloadAnchor = document.createElement('a')
      downloadAnchor.setAttribute('href', dataStr)
      downloadAnchor.setAttribute('download', `${familyName}-tree.json`)
      document.body.appendChild(downloadAnchor)
      downloadAnchor.click()
      downloadAnchor.remove()
      toast.success('Đã tải xuống file dữ liệu JSON!')
    } catch {
      toast.error('Lỗi khi xuất file JSON')
    }
  }

  // Export SVG vector file
  const handleExportSvg = () => {
    try {
      const svgEl = svgRef?.current || document.querySelector('svg')
      if (!svgEl) {
        toast.error('Không tìm thấy bản vẽ SVG')
        return
      }

      const svgData = new XMLSerializer().serializeToString(svgEl)
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const svgUrl = URL.createObjectURL(svgBlob)

      const downloadLink = document.createElement('a')
      downloadLink.href = svgUrl
      downloadLink.download = `${familyName}-tree.svg`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
      URL.revokeObjectURL(svgUrl)

      toast.success('Đã xuất file ảnh vector SVG thành công!')
    } catch {
      toast.error('Không thể xuất file SVG')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Xuất / Nhập Dữ Liệu Phả Hệ">
      <div className="space-y-4">
        {/* Tab switch */}
        <div className="flex border-b border-[var(--c-border)] gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('EXPORT')}
            className={`pb-2 px-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'EXPORT'
                ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-[var(--c-muted)] hover:text-[var(--c-text)]'
            }`}
          >
            📤 Xuất cây phả hệ
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('IMPORT')}
            className={`pb-2 px-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'IMPORT'
                ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-[var(--c-muted)] hover:text-[var(--c-text)]'
            }`}
          >
            📁 Nhập dữ liệu
          </button>
        </div>

        {activeTab === 'EXPORT' ? (
          <div className="space-y-4 py-2">
            <p className="text-xs text-[var(--c-muted)]">
              Bạn có thể tải xuống sơ đồ cây phả hệ dạng vector chất lượng cao hoặc xuất file dữ liệu sao lưu JSON:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-2 text-center">
                <span className="text-3xl block">🖼️</span>
                <h4 className="font-bold text-sm text-[var(--c-heading)]">Xuất File Ảnh SVG</h4>
                <p className="text-xs text-[var(--c-muted)]">
                  Ảnh vector độ nét tuyệt đối, phóng to không vỡ hình, in ấn kích thước lớn.
                </p>
                <Button variant="primary" onClick={handleExportSvg} className="w-full text-xs">
                  Tải ảnh SVG
                </Button>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] space-y-2 text-center">
                <span className="text-3xl block">💾</span>
                <h4 className="font-bold text-sm text-[var(--c-heading)]">Xuất Dữ Liệu JSON</h4>
                <p className="text-xs text-[var(--c-muted)]">
                  Sao lưu toàn bộ cấu trúc các thế hệ trong dòng họ để lưu trữ hoặc khôi phục.
                </p>
                <Button variant="secondary" onClick={handleExportJson} className="w-full text-xs">
                  Tải file JSON
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 py-2">
            <p className="text-xs text-[var(--c-muted)]">
              Dán nội dung JSON cây phả hệ để kiểm tra hoặc nhập dữ liệu mẫu:
            </p>
            <textarea
              rows={6}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder="Dán mã JSON phả hệ vào đây..."
              className="w-full p-3 font-mono text-xs bg-[var(--c-bg)] border border-[var(--c-border)] rounded-xl text-[var(--c-text)] focus:outline-hidden"
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={onClose} className="text-xs">
                Đóng
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  toast.info('Tính năng nhập trực tiếp đang hoàn thiện. Vui lòng thêm qua form thành viên.')
                }}
                className="text-xs"
              >
                Nhập dữ liệu
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
