import React, { useState, useEffect } from 'react'
import { Seo } from '@/components/common/Seo'
import { Card, Button } from '@/components/ui'
import { familyService } from '@/services/family.service'
import { useFamily } from '@/hooks/useFamily'
import { useToast } from '@/hooks/useToast'
import type { PersonDetail, MarriageStatus } from '@/types'

export default function RelationsPage() {
  const { currentFamilyId, currentFamily } = useFamily()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState<'PARENT' | 'MARRIAGE'>('PARENT')

  // Search Parent
  const [parentKeyword, setParentKeyword] = useState('')
  const [parentResults, setParentResults] = useState<PersonDetail[]>([])
  const [selectedParent, setSelectedParent] = useState<PersonDetail | null>(null)

  // Search Child
  const [childKeyword, setChildKeyword] = useState('')
  const [childResults, setChildResults] = useState<PersonDetail[]>([])
  const [selectedChild, setSelectedChild] = useState<PersonDetail | null>(null)

  // Search Marriage Person A & B
  const [personAKeyword, setPersonAKeyword] = useState('')
  const [personAResults, setPersonAResults] = useState<PersonDetail[]>([])
  const [selectedPersonA, setSelectedPersonA] = useState<PersonDetail | null>(null)

  const [personBKeyword, setPersonBKeyword] = useState('')
  const [personBResults, setPersonBResults] = useState<PersonDetail[]>([])
  const [selectedPersonB, setSelectedPersonB] = useState<PersonDetail | null>(null)

  const [marriageStatus, setMarriageStatus] = useState<MarriageStatus>('MARRIED')

  // Direct ID actions (Delete/Detail)
  const [actionRelationId, setActionRelationId] = useState('')
  const [actionMarriageId, setActionMarriageId] = useState('')

  const [submitting, setSubmitting] = useState(false)

  // Parent Search Debounce
  useEffect(() => {
    if (parentKeyword.trim().length < 2) {
      setParentResults([])
      return
    }
    const t = setTimeout(async () => {
      try {
        const res = await familyService.searchPersons({
          family_id: currentFamilyId,
          keyword: parentKeyword.trim(),
          page: 0,
          size: 10,
        })
        setParentResults(res.content || [])
      } catch (e) {
        console.error(e)
      }
    }, 250)
    return () => clearTimeout(t)
  }, [parentKeyword, currentFamilyId])

  // Child Search Debounce
  useEffect(() => {
    if (childKeyword.trim().length < 2) {
      setChildResults([])
      return
    }
    const t = setTimeout(async () => {
      try {
        const res = await familyService.searchPersons({
          family_id: currentFamilyId,
          keyword: childKeyword.trim(),
          page: 0,
          size: 10,
        })
        setChildResults(res.content || [])
      } catch (e) {
        console.error(e)
      }
    }, 250)
    return () => clearTimeout(t)
  }, [childKeyword, currentFamilyId])

  // Person A Search
  useEffect(() => {
    if (personAKeyword.trim().length < 2) {
      setPersonAResults([])
      return
    }
    const t = setTimeout(async () => {
      try {
        const res = await familyService.searchPersons({
          family_id: currentFamilyId,
          keyword: personAKeyword.trim(),
          page: 0,
          size: 10,
        })
        setPersonAResults(res.content || [])
      } catch (e) {
        console.error(e)
      }
    }, 250)
    return () => clearTimeout(t)
  }, [personAKeyword, currentFamilyId])

  // Person B Search
  useEffect(() => {
    if (personBKeyword.trim().length < 2) {
      setPersonBResults([])
      return
    }
    const t = setTimeout(async () => {
      try {
        const res = await familyService.searchPersons({
          family_id: currentFamilyId,
          keyword: personBKeyword.trim(),
          page: 0,
          size: 10,
        })
        setPersonBResults(res.content || [])
      } catch (e) {
        console.error(e)
      }
    }, 250)
    return () => clearTimeout(t)
  }, [personBKeyword, currentFamilyId])

  // Submit Parent-Child relation
  const handleCreateParentRelation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedParent || !selectedChild) {
      toast.error('Vui lòng chọn cả Cha/Mẹ và Con')
      return
    }
    if (selectedParent.id === selectedChild.id) {
      toast.error('Cha/mẹ và con không thể là cùng một người')
      return
    }

    setSubmitting(true)
    try {
      const res = await familyService.createParentRelation({
        family_id: currentFamilyId,
        parent_id: selectedParent.id,
        child_id: selectedChild.id,
      })
      toast.success(`Đã thiết lập quan hệ: "${selectedParent.full_name}" là cha/mẹ của "${selectedChild.full_name}" (Mã quan hệ: #${res.id})`)
      setSelectedParent(null)
      setSelectedChild(null)
      setParentKeyword('')
      setChildKeyword('')
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Không thể tạo quan hệ cha con')
    } finally {
      setSubmitting(false)
    }
  }

  // Submit Marriage
  const handleCreateMarriage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPersonA || !selectedPersonB) {
      toast.error('Vui lòng chọn cả hai người phối ngẫu')
      return
    }
    if (selectedPersonA.id === selectedPersonB.id) {
      toast.error('Hai người phối ngẫu không thể là cùng một người')
      return
    }

    setSubmitting(true)
    try {
      const res = await familyService.createMarriage({
        family_id: currentFamilyId,
        person_a_id: selectedPersonA.id,
        person_b_id: selectedPersonB.id,
        status: marriageStatus,
      })
      toast.success(`Đã tạo quan hệ hôn phối giữa "${selectedPersonA.full_name}" và "${selectedPersonB.full_name}" (Mã hôn nhân: #${res.id})`)
      setSelectedPersonA(null)
      setSelectedPersonB(null)
      setPersonAKeyword('')
      setPersonBKeyword('')
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Không thể tạo quan hệ hôn phối')
    } finally {
      setSubmitting(false)
    }
  }

  // Delete relation by ID
  const handleDeleteRelationById = async () => {
    const idNum = Number(actionRelationId)
    if (!idNum) return
    setSubmitting(true)
    try {
      await familyService.deleteParentRelation(idNum)
      toast.success(`Đã xóa quan hệ cha con mã #${idNum}`)
      setActionRelationId('')
    } catch (err) {
      console.error('Lỗi xóa quan hệ cha con:', err)
      toast.error('Không thể xóa quan hệ cha con này')
    } finally {
      setSubmitting(false)
    }
  }

  // Delete marriage by ID
  const handleDeleteMarriageById = async () => {
    const idNum = Number(actionMarriageId)
    if (!idNum) return
    setSubmitting(true)
    try {
      await familyService.deleteMarriage(idNum)
      toast.success(`Đã xóa quan hệ hôn phối mã #${idNum}`)
      setActionMarriageId('')
    } catch (err) {
      console.error('Lỗi xóa quan hệ hôn phối:', err)
      toast.error('Không thể xóa quan hệ hôn phối này')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <Seo
        title={`Quản lý quan hệ – ${currentFamily?.name || 'Gia phả'}`}
        description="Gán và quản lý các mối quan hệ Cha - Mẹ - Con và Hôn nhân trong dòng họ."
      />

      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--c-heading)] tracking-tight">
          Quản Lý Quan Hệ Phả Hệ
        </h1>
        <p className="text-sm text-[var(--c-muted)] mt-1">
          Thiết lập và quản lý quan hệ huyết thống (Cha/Mẹ - Con) và quan hệ hôn phối (Phu thê).
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--c-border)] gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('PARENT')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'PARENT'
              ? 'border-amber-600 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-[var(--c-muted)] hover:text-[var(--c-text)]'
          }`}
        >
          👨‍👧 Quan hệ Cha/Mẹ - Con
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('MARRIAGE')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'MARRIAGE'
              ? 'border-amber-600 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-[var(--c-muted)] hover:text-[var(--c-text)]'
          }`}
        >
          💍 Quan hệ Hôn phối (Vợ / Chồng)
        </button>
      </div>

      {/* TAB 1: PARENT - CHILD */}
      {activeTab === 'PARENT' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-[var(--c-heading)] mb-4 flex items-center gap-2">
              <span>👨‍👧</span> Thiết lập quan hệ Cha/Mẹ - Con mới
            </h2>

            <form onSubmit={handleCreateParentRelation} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Parent Select Column */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[var(--c-muted)] uppercase tracking-wider">
                    1. Chọn Cha hoặc Mẹ:
                  </label>

                  {selectedParent ? (
                    <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm text-[var(--c-heading)]">
                          {selectedParent.full_name}
                        </p>
                        <p className="text-xs text-[var(--c-muted)]">
                          Đời {selectedParent.generation} {selectedParent.birth_year ? `• s.${selectedParent.birth_year}` : ''}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedParent(null)}
                        className="text-xs text-rose-600 hover:underline font-semibold"
                      >
                        Đổi
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Tìm theo tên cha/mẹ..."
                        value={parentKeyword}
                        onChange={(e) => setParentKeyword(e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--c-bg)] border border-[var(--c-border)] rounded-xl text-sm text-[var(--c-text)] focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
                      />
                      {parentResults.length > 0 && (
                        <div className="max-h-40 overflow-y-auto space-y-1 p-1 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                          {parentResults.map((p) => (
                            <div
                              key={p.id}
                              onClick={() => {
                                setSelectedParent(p)
                                setParentResults([])
                              }}
                              className="p-2 text-xs rounded-lg hover:bg-amber-100 dark:hover:bg-slate-700 cursor-pointer flex items-center justify-between"
                            >
                              <span className="font-semibold">{p.full_name}</span>
                              <span className="text-[11px] text-[var(--c-muted)]">
                                Đời {p.generation}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Child Select Column */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[var(--c-muted)] uppercase tracking-wider">
                    2. Chọn Con:
                  </label>

                  {selectedChild ? (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm text-[var(--c-heading)]">
                          {selectedChild.full_name}
                        </p>
                        <p className="text-xs text-[var(--c-muted)]">
                          Đời {selectedChild.generation} {selectedChild.birth_year ? `• s.${selectedChild.birth_year}` : ''}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedChild(null)}
                        className="text-xs text-rose-600 hover:underline font-semibold"
                      >
                        Đổi
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Tìm theo tên con..."
                        value={childKeyword}
                        onChange={(e) => setChildKeyword(e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--c-bg)] border border-[var(--c-border)] rounded-xl text-sm text-[var(--c-text)] focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
                      />
                      {childResults.length > 0 && (
                        <div className="max-h-40 overflow-y-auto space-y-1 p-1 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                          {childResults.map((p) => (
                            <div
                              key={p.id}
                              onClick={() => {
                                setSelectedChild(p)
                                setChildResults([])
                              }}
                              className="p-2 text-xs rounded-lg hover:bg-emerald-100 dark:hover:bg-slate-700 cursor-pointer flex items-center justify-between"
                            >
                              <span className="font-semibold">{p.full_name}</span>
                              <span className="text-[11px] text-[var(--c-muted)]">
                                Đời {p.generation}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--c-border)] flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  loading={submitting}
                  disabled={!selectedParent || !selectedChild}
                >
                  Xác nhận gán quan hệ
                </Button>
              </div>
            </form>
          </Card>

          {/* Delete relation by ID quick box */}
          <Card className="p-5 border-dashed">
            <h3 className="text-sm font-bold text-[var(--c-heading)] mb-2">
              Xóa quan hệ Cha/Mẹ - Con theo ID:
            </h3>
            <div className="flex gap-2 max-w-sm">
              <input
                type="number"
                placeholder="Nhập ID quan hệ (vd: 12)..."
                value={actionRelationId}
                onChange={(e) => setActionRelationId(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-[var(--c-bg)] border border-[var(--c-border)] rounded-xl text-sm text-[var(--c-text)] focus:outline-hidden"
              />
              <Button
                variant="danger"
                onClick={handleDeleteRelationById}
                disabled={!actionRelationId || submitting}
              >
                Xóa quan hệ
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: MARRIAGE */}
      {activeTab === 'MARRIAGE' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-[var(--c-heading)] mb-4 flex items-center gap-2">
              <span>💍</span> Thiết lập quan hệ Hôn phối mới
            </h2>

            <form onSubmit={handleCreateMarriage} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Person A */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[var(--c-muted)] uppercase tracking-wider">
                    1. Người thứ nhất (Chồng / Vợ):
                  </label>

                  {selectedPersonA ? (
                    <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm text-[var(--c-heading)]">
                          {selectedPersonA.full_name}
                        </p>
                        <p className="text-xs text-[var(--c-muted)]">
                          {selectedPersonA.gender === 'female' ? 'Nữ' : 'Nam'} • Đời {selectedPersonA.generation}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedPersonA(null)}
                        className="text-xs text-rose-600 hover:underline font-semibold"
                      >
                        Đổi
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Tìm kiếm người thứ nhất..."
                        value={personAKeyword}
                        onChange={(e) => setPersonAKeyword(e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--c-bg)] border border-[var(--c-border)] rounded-xl text-sm text-[var(--c-text)] focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
                      />
                      {personAResults.length > 0 && (
                        <div className="max-h-40 overflow-y-auto space-y-1 p-1 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                          {personAResults.map((p) => (
                            <div
                              key={p.id}
                              onClick={() => {
                                setSelectedPersonA(p)
                                setPersonAResults([])
                              }}
                              className="p-2 text-xs rounded-lg hover:bg-amber-100 dark:hover:bg-slate-700 cursor-pointer flex items-center justify-between"
                            >
                              <span className="font-semibold">{p.full_name}</span>
                              <span className="text-[11px] text-[var(--c-muted)]">
                                Đời {p.generation}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Person B */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[var(--c-muted)] uppercase tracking-wider">
                    2. Người thứ hai (Vợ / Chồng):
                  </label>

                  {selectedPersonB ? (
                    <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm text-[var(--c-heading)]">
                          {selectedPersonB.full_name}
                        </p>
                        <p className="text-xs text-[var(--c-muted)]">
                          {selectedPersonB.gender === 'female' ? 'Nữ' : 'Nam'} • Đời {selectedPersonB.generation}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedPersonB(null)}
                        className="text-xs text-rose-600 hover:underline font-semibold"
                      >
                        Đổi
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Tìm kiếm người thứ hai..."
                        value={personBKeyword}
                        onChange={(e) => setPersonBKeyword(e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--c-bg)] border border-[var(--c-border)] rounded-xl text-sm text-[var(--c-text)] focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
                      />
                      {personBResults.length > 0 && (
                        <div className="max-h-40 overflow-y-auto space-y-1 p-1 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                          {personBResults.map((p) => (
                            <div
                              key={p.id}
                              onClick={() => {
                                setSelectedPersonB(p)
                                setPersonBResults([])
                              }}
                              className="p-2 text-xs rounded-lg hover:bg-rose-100 dark:hover:bg-slate-700 cursor-pointer flex items-center justify-between"
                            >
                              <span className="font-semibold">{p.full_name}</span>
                              <span className="text-[11px] text-[var(--c-muted)]">
                                Đời {p.generation}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Status Select */}
              <div>
                <label className="block text-xs font-bold text-[var(--c-muted)] uppercase tracking-wider mb-1">
                  3. Tình trạng hôn nhân:
                </label>
                <select
                  value={marriageStatus}
                  onChange={(e) => setMarriageStatus(e.target.value as MarriageStatus)}
                  className="w-full max-w-xs px-3 py-2 bg-[var(--c-bg)] border border-[var(--c-border)] rounded-xl text-sm text-[var(--c-text)] focus:outline-hidden"
                >
                  <option value="MARRIED">Đã kết hôn (MARRIED)</option>
                  <option value="WIDOWED">Đã góa (WIDOWED)</option>
                  <option value="DIVORCED">Đã ly hôn (DIVORCED)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-[var(--c-border)] flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  loading={submitting}
                  disabled={!selectedPersonA || !selectedPersonB}
                >
                  Xác nhận gán hôn phối
                </Button>
              </div>
            </form>
          </Card>

          {/* Delete marriage by ID quick box */}
          <Card className="p-5 border-dashed">
            <h3 className="text-sm font-bold text-[var(--c-heading)] mb-2">
              Xóa quan hệ Hôn phối theo ID:
            </h3>
            <div className="flex gap-2 max-w-sm">
              <input
                type="number"
                placeholder="Nhập ID hôn nhân (vd: 75)..."
                value={actionMarriageId}
                onChange={(e) => setActionMarriageId(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-[var(--c-bg)] border border-[var(--c-border)] rounded-xl text-sm text-[var(--c-text)] focus:outline-hidden"
              />
              <Button
                variant="danger"
                onClick={handleDeleteMarriageById}
                disabled={!actionMarriageId || submitting}
              >
                Xóa hôn nhân
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
