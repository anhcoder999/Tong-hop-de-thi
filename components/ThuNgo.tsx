"use client";
import {motion} from "framer-motion";
import {IconArrowRight, IconSeal} from "@/components/Icons";
import {EASE} from "@/lib/animations";
const DOAN_1 = "Không biết lúc cậu mở trang web này ra thì ngoài trời đang là buổi sáng, hay đã khuya lắm rồi mà cậu vẫn còn ngồi bên bàn học nhỉ? Dạo này việc ôn tập của cậu thế nào rồi, có bị ngợp vì bài vở hay áp lực quá trước kỳ thi sắp tới không? Nếu thấy hơi mệt, cậu cứ hít một hơi thật sâu, uống một ngụm nước rồi hẳn bắt đầu nhé.";
const DOAN_2 = "Góc nhỏ này mình làm ra với mong muốn rất đơn giản: gom góp lại những bộ đề thi về chung một chỗ cho gọn gàng, để mỗi lần cần luyện tập là cậu có sẵn ngay, đỡ mất công lặn lội tìm kiếm khắp nơi. Kho đề vẫn đang được mình cập nhật dần theo thời gian nên chắc chắn sẽ còn những chỗ chưa đầy đủ, mong cậu thông cảm nếu đôi lúc chưa tìm thấy đúng môn mình cần.";
const DOAN_3 = "Chặng đường ôn thi lúc nào cũng dễ nản, nên cậu nhớ giữ gìn sức khỏe, đừng ép bản thân thức khuya quá nhé. Làm thử một đề có sai vài câu cũng chẳng sao cả, miễn là mình nhận ra chỗ còn hổng để kịp vá lại trước khi bước vào phòng thi thật.";
const DOAN_4 = "Chúc cậu luôn giữ được cái đầu tỉnh táo, làm bài thật chắc tay và đạt được kết quả xứng đáng với những gì cậu đã bỏ ra. Cứ bình tĩnh mà bước, rồi mọi chuyện sẽ ổn cả thôi!";
const PS = "P.S. Hôm nào thấy đầu óc quay cuồng quá thì cứ gấp sách lại đi ngủ một giấc cho khỏe, mai mình lại làm tiếp nhé.";
const LOP_CHU = "font-display text-[15px] leading-7 text-ink-soft";
const DROP_CAP = "first-letter:float-left first-letter:mr-2 first-letter:mt-1 first-letter:font-display first-letter:text-5xl first-letter:font-bold first-letter:leading-[0.8] first-letter:text-accent";
export default function ThuNgo() {
  return (
    <motion.section id="thu-ngo" initial={{opacity: 0, y: 24}} whileInView={{opacity: 1, y: 0}} viewport={{once: true, margin: "-70px"}} transition={{duration: 0.5, ease: EASE}} className="mt-14 scroll-mt-28">
      <div className="sheet relative mx-auto max-w-3xl rotate-[0.4deg] border-2 border-ink bg-paper-light p-5 shadow-lift sm:p-7">
        <span className="absolute -top-3 left-10 h-6 w-28 -rotate-2 border border-ink/10 bg-accent-wash/90" />
        <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-ink-faint">
          <IconSeal className="h-3.5 w-3.5 text-accent" />
          Thư gửi cậu
        </p>
        <p className="mt-4 font-display text-lg italic text-ink">Chào cậu,</p>
        <div className="mt-3 space-y-3.5">
          <p className={`${LOP_CHU} ${DROP_CAP}`}>{DOAN_1}</p>
          <p className={LOP_CHU}>{DOAN_2}</p>
          <p className={LOP_CHU}>{DOAN_3}</p>
          <p className={LOP_CHU}>{DOAN_4}</p>
        </div>
        <p className="mt-3.5 font-display text-sm italic text-ink-faint">{PS}</p>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-dashed border-ink/25 pt-4">
          <div>
            <p className="font-display text-xl font-bold italic text-ink">Anh Lusilfer</p>
            <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-ink-faint">người gom đề</p>
          </div>
          <a href="https://anhcoder999.github.io/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 border border-accent bg-accent-wash px-3 py-1.5 text-xs font-bold text-accent-deep underline decoration-wavy underline-offset-4 transition-colors hover:bg-accent hover:text-paper-light">
            Hồ sơ người viết
            <IconArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </motion.section>
  );
}