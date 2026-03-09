import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { propertiesApi, naverAdsApi, naverAdMatchSuggestionsApi, consultationsApi, contactsApi } from '@/api'
import type { Property } from '@/types'

interface UsePropertyMutationsOptions {
  onPropertyUpdated?: () => void
  onConsultationCreated?: () => void
  onNaverAdLinked?: () => void
}

export function usePropertyMutations(options: UsePropertyMutationsOptions = {}) {
  const queryClient = useQueryClient()

  // 매물 수정 뮤테이션
  const updatePropertyMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Property> }) =>
      propertiesApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      toast.success('매물 정보가 저장되었습니다')
      options.onPropertyUpdated?.()
    },
    onError: () => {
      toast.error('매물 저장에 실패했습니다')
    },
  })

  // 정보 확인 (모달 닫지 않음)
  const verifyInfoMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Property> }) =>
      propertiesApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      toast.success('정보 확인이 완료되었습니다')
      // 모달을 닫지 않음
    },
    onError: () => {
      toast.error('정보 확인에 실패했습니다')
    },
  })

  // 숨기기/보이기 토글
  const toggleHideMutation = useMutation({
    mutationFn: ({ id, isHidden }: { id: string; isHidden: boolean }) =>
      propertiesApi.update(id, { isHidden }),
    onSuccess: (_, { isHidden }) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      toast.success(isHidden ? '매물을 숨겼습니다' : '매물을 다시 표시합니다')
    },
    onError: () => {
      toast.error('처리에 실패했습니다')
    },
  })

  // 상담 추가 뮤테이션
  const createConsultationMutation = useMutation({
    mutationFn: consultationsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] })
      toast.success('상담 내역이 추가되었습니다')
      options.onConsultationCreated?.()
    },
    onError: () => {
      toast.error('상담 추가에 실패했습니다')
    },
  })

  // 네이버 광고 동기화
  const syncNaverAdsMutation = useMutation({
    mutationFn: naverAdsApi.sync,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['naverAds'] })
      queryClient.invalidateQueries({ queryKey: ['naverAdMatchSuggestions'] })
      toast.success('네이버 광고를 동기화했습니다')
    },
    onError: () => {
      toast.error('동기화에 실패했습니다')
    },
  })

  // 광고-매물 연결
  const linkAdMutation = useMutation({
    mutationFn: ({ adId, propertyId }: { adId: string; propertyId: string }) =>
      naverAdsApi.linkToProperty(adId, propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['naverAds'] })
      queryClient.invalidateQueries({ queryKey: ['naverAdMatchSuggestions'] })
      toast.success('광고가 매물에 연결되었습니다')
      options.onNaverAdLinked?.()
    },
    onError: () => {
      toast.error('연결에 실패했습니다')
    },
  })

  // 광고-매물 연결 해제
  const unlinkAdMutation = useMutation({
    mutationFn: (adId: string) => naverAdsApi.unlinkFromProperty(adId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['naverAds'] })
      toast.success('광고 연결이 해제되었습니다')
    },
    onError: () => {
      toast.error('연결 해제에 실패했습니다')
    },
  })

  // 매칭 제안 수락
  const acceptSuggestionMutation = useMutation({
    mutationFn: ({ adId, propertyId }: { adId: string; propertyId: string }) =>
      naverAdMatchSuggestionsApi.accept(adId, propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['naverAds'] })
      queryClient.invalidateQueries({ queryKey: ['naverAdMatchSuggestions'] })
      toast.success('매칭을 수락했습니다')
    },
    onError: () => {
      toast.error('매칭 수락에 실패했습니다')
    },
  })

  // 매칭 제안 거절
  const dismissSuggestionMutation = useMutation({
    mutationFn: ({ adId, propertyId }: { adId: string; propertyId: string }) =>
      naverAdMatchSuggestionsApi.dismiss(adId, propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['naverAdMatchSuggestions'] })
      toast.success('매칭을 거절했습니다')
    },
    onError: () => {
      toast.error('매칭 거절에 실패했습니다')
    },
  })

  // 소유주 저장 (Contact 생성)
  const saveOwnerMutation = useMutation({
    mutationFn: async (data: { name: string; phone: string; phone2?: string }) => {
      return contactsApi.create({
        name: data.name,
        phone: data.phone,
        phone2: data.phone2,
        tags: ['소유주'],
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      toast.success('소유주 정보가 저장되었습니다')
    },
    onError: () => {
      toast.error('소유주 저장에 실패했습니다')
    },
  })

  return {
    updatePropertyMutation,
    verifyInfoMutation,
    toggleHideMutation,
    createConsultationMutation,
    syncNaverAdsMutation,
    linkAdMutation,
    unlinkAdMutation,
    acceptSuggestionMutation,
    dismissSuggestionMutation,
    saveOwnerMutation,
  }
}
