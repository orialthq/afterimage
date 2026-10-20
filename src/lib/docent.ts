import { artistById, artworks } from '../data/catalog'
import type { Artwork, Exhibition } from '../data/types'
import { auctionPrice, clock, currentPrice, won } from './sale'

// 큐레이터 에이전트 인터페이스.
// MVP: 카탈로그 기반 규칙 엔진(답은 항상 카탈로그 안에서만 → 환각 불가).
// 다음 단계: 같은 인터페이스로 BYOK LLM 엔진 연결, 답변은 카탈로그 근거만 인용하도록 제한.

export interface DocentContext {
  exhibition: Exhibition
  focus?: Artwork
}

export interface DocentReply {
  text: string
  /** 답변이 가리키는 작품 — UI에서 해당 작품으로 이동 */
  pointTo?: string
}

export interface DocentEngine {
  reply(ctx: DocentContext, message: string): Promise<DocentReply>
}

const has = (q: string, ...words: string[]) => words.some((w) => q.includes(w))

export const ruleDocent: DocentEngine = {
  async reply(ctx, raw) {
    const q = raw.replace(/\s+/g, '')
    const w = findMentioned(q) ?? ctx.focus
    const a = w ? artistById(w.artistId) : undefined

    // "저번에 봤던 회색 도자기 다시 보여줘" 류 — 작품 찾기
    if (has(q, '보여줘', '찾아', '어디')) {
      const hit = findMentioned(q, true)
      if (hit) {
        return {
          text: `${artistById(hit.artistId).name} 작가의 〈${hit.title}〉로 모실게요. ${hit.medium}, ${hit.size}입니다.`,
          pointTo: hit.id,
        }
      }
    }

    if (!w || !a) {
      if (has(q, '추천', '뭐부터', '처음'))
        return {
          text: '처음 오셨다면 〈새벽 4시의 냉장고 불빛〉부터 보세요. 이번 기획전의 문을 여는 작품이고, 정리 예정일까지 사흘 남았어요.',
          pointTo: 'w01',
        }
      return {
        text: `이번 기획전 〈${ctx.exhibition.title}〉은 작업실을 비워야 하는 네 작가의 작품 여덟 점이에요. 작품 앞에 서시면 그 작품 이야기를 해드릴게요. "회색 도자기 보여줘"처럼 말씀하셔도 됩니다.`,
      }
    }

    if (has(q, '가격', '얼마', '비싸', '싸')) {
      const s = w.sale
      if (s.type === 'auction') {
        const p = auctionPrice(s)
        return {
          text: `지금 가격은 ${won(p)}이에요. 내림 경매라 한 시간마다 ${won(s.dropPerHour)}씩 내려가고, ${won(s.floorPrice)}에서 멈춥니다. 다만 그 전에 누군가 소장하면 끝이에요.`,
        }
      }
      if (s.type === 'rescue')
        return {
          text: `${won(s.price)}입니다. 이 가격의 70%가 ${a.name} 작가에게 갑니다. 정리 예정일까지 ${clock(s.disposeAt - Date.now())} 남았어요.`,
        }
      return { text: `${won(s.price)}입니다. 이 가격의 70%가 ${a.name} 작가에게 갑니다.` }
    }

    if (has(q, '버려', '폐기', '정리', '구조', '왜'))
      return {
        text:
          w.sale.type === 'rescue'
            ? `${a.name} 작가는 ${a.history.at(-1)?.text ?? '작업실을 정리'}하고 있어요. 이 작품은 정리 예정일이 지나면 보관할 곳이 없어요. 그래서 여기서는 구매를 '구조'라고 불러요.`
            : `이 작품은 아직 정리 예정일이 정해지지 않았어요. 하지만 ${a.name} 작가의 작업실 사정상 오래 보관하긴 어렵다고 들었어요.`,
      }

    if (has(q, '작가', '누구', '시작', '이유', '철학'))
      return { text: `${a.name} 작가(${a.school})는 이렇게 말했어요. "${a.origin}"` }

    if (has(q, '재료', '기법', '어떻게', '만들'))
      return { text: `${w.medium}로 만든 작품이에요. ${w.story}` }

    if (has(q, '크기', '사이즈', '방', '원룸', '걸'))
      return {
        text: `${w.size}입니다. ${w.kind === 'vessel' ? '선반이나 협탁 위에 두기 좋은 크기예요.' : '원룸 한쪽 벽에 단독으로 걸면 충분히 존재감이 있어요.'}`,
      }

    if (has(q, '배송', '언제받', '포장'))
      return {
        text: `작품은 지금 ${a.name} 작가가 보관 중이에요. 소장이 확정되면 작가가 직접 포장해 7일 안에 보내드려요. 도자기와 대형 작품은 전문 미술품 배송으로 보냅니다.`,
      }

    if (has(q, '다른작품', '비슷', '또'))
      {
        const sib = artworks.find((x) => x.artistId === w.artistId && x.id !== w.id)
        if (sib)
          return {
            text: `${a.name} 작가의 다른 작품 〈${sib.title}〉도 이번 전시에 있어요. 지금 가격은 ${won(currentPrice(sib.sale))}입니다.`,
            pointTo: sib.id,
          }
      }

    return {
      text: `〈${w.title}〉 이야기를 조금 더 해드릴게요. ${w.story} 작가는 이렇게 정리했어요. "${a.statement}"`,
    }
  },
}

const ALIASES: [string[], string][] = [
  [['냉장고', '새벽', '노란'], 'w01'],
  [['회색', '도자기', '항아리', '달항아리', '물이지나간'], 'w02'],
  [['이불', '덧댐', '할머니'], 'w03'],
  [['판화', '마지막장', '갈라'], 'w04'],
  [['반지하', '창문', '오후'], 'w05'],
  [['깨진', '그릇', '금분', '금간'], 'w06'],
  [['먹', '말대신', '선하나'], 'w07'],
  [['옷', '입던', '염색'], 'w08'],
]

function findMentioned(q: string, strict = false): Artwork | undefined {
  const byTitle = artworks.find((a) => q.includes(a.title.replace(/\s+/g, '')))
  if (byTitle) return byTitle
  for (const [keys, id] of ALIASES) if (keys.some((k) => q.includes(k))) return artworks.find((a) => a.id === id)
  return strict ? undefined : undefined
}

export const suggestedQuestions = (focus?: Artwork) =>
  focus
    ? ['작가는 왜 이걸 만들었어요?', '지금 가격이 얼마예요?', '왜 버려질 뻔했어요?', '원룸에 걸어도 돼요?']
    : ['뭐부터 보면 좋을까요?', '회색 도자기 보여줘', '이 전시는 어떤 전시예요?']
