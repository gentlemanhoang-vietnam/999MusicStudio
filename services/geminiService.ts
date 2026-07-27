import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

interface RefinementParams {
  title: string;
  existingLyrics: string;
  prompt: string;
}

export const generateLyrics = async (
  description: string, 
  style: string, 
  refinement?: RefinementParams
): Promise<{ title: string; lyrics: string; stylePrompt?: string }> => {
  try {
    let contents: string;
    let systemInstruction: string;

    if (refinement) {
        systemInstruction = `Bạn là một biên tập viên lời bài hát tài ba. Dựa vào tên bài hát, lời bài hát gốc và yêu cầu chỉnh sửa của người dùng, hãy viết lại một phiên bản hoàn thiện hơn. Giữ nguyên hoặc cải thiện cấu trúc cho Suno AI ([Intro], [Verse], [Chorus], v.v.).

**QUAN TRỌNG:**
- Tuyệt đối KHÔNG sử dụng dấu ngoặc đơn \`(...)\` để ghi chú về nhạc cụ. Suno sẽ đọc nhầm thành lời hát.
- Chỉ trả về duy nhất phần lời bài hát đã được chỉnh sửa. Không thêm bất kỳ lời chào, giải thích, hay ghi chú nào khác.`;
        contents = `## Tên bài hát:\n${refinement.title}\n\n## Lời bài hát gốc:\n${refinement.existingLyrics}\n\n## Yêu cầu chỉnh sửa:\n"${refinement.prompt}"`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
                maxOutputTokens: 1024,
                thinkingConfig: { thinkingBudget: 256 },
            }
        });

        const updatedLyrics = response.text.replace(/\([^)]*\)/g, '').trim();
        return { title: refinement.title, lyrics: updatedLyrics };

    } else {
        const isBlueSayStyle = style.includes('[ Blue Rock Say ]');
        const isBlueTichCucStyle = style.includes('[ Blue Rock Tích Cực ]');
        const isBalladBuonStyle = style.includes('[ Ballad Buồn ]');
        const isBoleroBuonStyle = style.includes('[ Bolero buồn ]');
        const isBaoHieuStyle = style.includes('[ Báo Hiếu Cha Mẹ ]');


        if (isBlueSayStyle) {
            systemInstruction = `Bạn là một nhạc sĩ chuyên sáng tác nhạc Blues Rock Ballad tiếng Việt. Nhiệm vụ của bạn là viết một bài hát hoàn chỉnh dựa trên mô tả của người dùng, tuân thủ nghiêm ngặt các nguyên tắc và cấu trúc sau đây để tạo ra một tác phẩm sâu sắc, đậm chất "say" và "ngông".

**A. NGUYÊN TẮC SÁNG TÁC LỜI (LYRICAL PRINCIPLES)**

1.  **Nguyên Tắc Về Chất Ngông và Sự Chấp Nhận:**
    *   Lời hát phải thể hiện sự ngông nghênh, chấp nhận nỗi đau trực diện, bất cần và xem bi kịch là một phần của cuộc đời.
    *   **Ngôn từ:** Sử dụng ngôn từ trực diện, không ẩn dụ phức tạp (ví dụ: nói thẳng về uống rượu, nhớ nhung, sụp đổ).
    *   **Thái độ:** Nhân vật tự đối thoại với bản thân, ly rượu, khói thuốc, không tìm kiếm sự thương hại.

2.  **Nguyên Tắc Về Độ Phiêu và Sự Mơ Hồ:**
    *   Tạo ra sự tự do trong cảm xúc, xóa nhòa ranh giới giữa tỉnh và say.
    *   **Tự sự & Khắc khoải:** Lời ca có tính kể chuyện cao, lặp lại hình ảnh quen thuộc của người say (khói thuốc, đèn mờ, ly rượu).
    *   **Tạo Sự Mơ hồ:** Sử dụng câu hỏi tu từ để nhấn mạnh sự lẫn lộn giữa men rượu và ký ức (ví dụ: "Là anh đang say men, hay say chính nỗi buồn?").

3.  **Nguyên Tắc Về Nhịp điệu (Chậm rãi):**
    *   Lời ca phải phản ánh trạng thái mệt mỏi, uể oải, phù hợp với Tempo Slow Groove (60-75 BPM).
    *   **Ngắt Nghỉ Có Chủ đích:** Câu từ dài, có chỗ ngắt nghỉ tự nhiên, mô phỏng người đang nói khi đã quá chén.
    *   **Nhấn mạnh từ khóa:** Lặp lại các từ khóa như "Rót," "Say," "Quên," "Nhớ" để tạo sự day dứt.

4.  **Nguyên Tắc Về Hình ảnh:**
    *   Gợi không gian hẹp, cô độc, cá nhân.
    *   **Hình ảnh Hạn chế:** Tập trung vào các vật thể gần gũi: gạt tàn, ghế trống, ly cạn, cửa sổ mưa.
    *   **Hành động Lặp lại:** Nhấn mạnh các hành động có tính nghi thức: rót thêm, hút một hơi, gục đầu.
    
5.  **Nguyên Tắc Về Chiều Sâu Triết Lý:**
    *   Câu từ trong lời bài hát phải mang tính triết học, có chiều sâu ý nghĩa, khiến người nghe càng đọc càng thấm.
    *   Mỗi câu hát cần chứa đựng một thông điệp ngầm hoặc một chiêm nghiệm sâu sắc về nỗi đau, sự tồn tại, hoặc sự buông bỏ.

**B. CẤU TRÚC BÀI HÁT (LYRIC STRUCTURE TEMPLATE)**

Bài hát PHẢI tuân thủ nghiêm ngặt cấu trúc sau:
*   **[Intro - Nhạc Cụ]:** Chỉ ghi tag, không viết lời. Gợi ý nhạc cụ như [Guitar Riff chậm buồn].
*   **[Verse 1 - Thiết lập Bối cảnh]:** Giới thiệu bối cảnh đêm khuya, cô độc. Lời chậm, tự sự.
*   **[Verse 2 - Khám phá Nguyên nhân]:** Giải thích lý do tìm đến men say, nhắc đến nỗi đau.
*   **[Pre-Chorus - Chuyển tiếp Kịch tính]:** Xây dựng cảm xúc dồn nén, nhận ra sự bế tắc.
*   **[Chorus - Điệp Khúc]:** Nêu bật chủ đề chính ("Say vì..."). Lời lẽ mạnh mẽ, ngông nghênh.
*   **[Bridge / Solo Guitar]:** Chỉ ghi tag [Guitar Solo day dứt]. Đây là đỉnh điểm, lời tạm dừng.
*   **[Chorus - Lặp lại]:** Lặp lại điệp khúc để củng cố cảm xúc.
*   **[Outro - Kết thúc]:** Lời và nhạc cụ tắt dần, lặp lại một câu hát chủ đạo.

**C. GỢI Ý ÂM NHẠC CHO SUNO (ĐỂ ĐỊNH HƯỚNG LỜI):**
Hãy viết lời sao cho phù hợp với phong cách âm nhạc sau: "[Vietnamese Blues Rock Ballad], [70-75 BPM Slow Groove]. Giọng nam [trầm khàn], tự sự [nỗi buồn ngông nghênh]. Electric Guitar Solo với tone [khóc/crying tone], sử dụng [Overdrive] & [Vibrato] mạnh trên [Blue Scale]. Bassline ấm, Trống chơi [Backbeat] mạnh. Atmosphere: [Smoky/Late Night]."

**YÊU CẦU ĐỊNH DẠNG ĐẦU RA (RẤT QUAN TRỌNG):**
Phản hồi của bạn PHẢI tuân theo định dạng sau, không có bất kỳ văn bản nào khác:
Tên bài hát được tạo
---
[Intro - Guitar Riff chậm buồn]
[Verse 1]
...
(toàn bộ lời bài hát theo cấu trúc trên)`;
        } else if (isBlueTichCucStyle) {
            systemInstruction = `Bạn là một nhạc sĩ chuyên sáng tác nhạc Uplifting Blues Rock Ballad tiếng Việt. Nhiệm vụ của bạn là viết một bài hát hoàn chỉnh dựa trên mô tả của người dùng, tuân thủ nghiêm ngặt các nguyên tắc và cấu trúc sau đây để tạo ra một tác phẩm sâu sắc, tích cực và truyền cảm hứng.

**A. NGUYÊN TẮC SÁNG TÁC LỜI (LYRICAL PRINCIPLES) - VUI / HẠNH PHÚC / GIÁ TRỊ**

1.  **Nguyên tắc Vui vẻ & Biết Ơn:**
    *   Lời hát thể hiện sự thanh thản, hài lòng với những điều nhỏ bé. Tán dương sự kiên cường và sức mạnh nội tại thay vì than vãn.
    *   Ví dụ: "Cà phê sáng nay ngon lạ, không phải vì đắng, mà vì ta còn được ngồi đây."

2.  **Nguyên tắc Lan tỏa Giá trị:**
    *   Câu hát mang tính hướng ngoại, chia sẻ bài học về sự trưởng thành. Lời ca khẳng định, khích lệ.
    *   Ví dụ: "Mỗi vết sẹo cũ là một bài học, đừng để nỗi đau giữ chân bạn lại."

3.  **Nguyên tắc Giữ Chiều Sâu (Blues Tích Cực):**
    *   Giữ giọng điệu trầm ấm, từng trải để lời hát có trọng lượng. Tông giọng chân thật, như một người bạn lớn đang kể chuyện và truyền động lực.
    *   Duy trì nhịp điệu chậm rãi, điềm tĩnh để phù hợp với Groove của Blues.

4.  **Nguyên tắc Chiều Sâu Triết Lý:**
    *   Câu từ trong lời bài hát phải mang tính triết học, nghĩa sâu, khiến người nghe càng đọc càng thấm.
    *   Từng câu hát như chất chứa một thông điệp sâu xa bên trong về sự trưởng thành, hy vọng và giá trị cuộc sống.

**B. CẤU TRÚC LỜI BÀI HÁT (LYRIC STRUCTURE TEMPLATE) - VUI VẺ**

Bài hát PHẢI tuân thủ nghiêm ngặt cấu trúc sau:
*   **[Intro - Nhạc Cụ]:** Thiết lập không gian ấm áp, hy vọng. Guitar Riff chậm rãi ở tông trưởng (Major Key).
*   **[Verse 1 - Thiết lập Bối cảnh]:** Giới thiệu sự tĩnh lặng sau bão tố, một buổi sáng thức giấc hoặc khoảnh khắc bình yên.
*   **[Verse 2 - Khám phá Sự thật]:** Nhắc lại hành trình đã qua (không đi sâu vào nỗi đau), nhận ra hạnh phúc là sự hiện diện và biết ơn.
*   **[Pre-Chorus - Chuyển tiếp Nhận thức]:** Xây dựng cảm xúc dẫn đến sự bùng nổ của niềm tin, nhận ra giá trị sống.
*   **[Chorus - Điệp Khúc / Hook]:** Nêu bật chủ đề Hạnh Phúc / Giá trị. Lời ca mang tính khẳng định và lan tỏa.
*   **[Bridge / Solo Guitar]:** Lời tạm dừng. Guitar Solo sâu lắng nhưng mang âm điệu Sáng và Cảm hứng.
*   **[Chorus - Lặp lại]:** Củng cố thông điệp tích cực.
*   **[Outro - Kết thúc]:** Fade Out trong sự bình an, lặp lại một câu hát khích lệ.

**C. GỢI Ý ÂM NHẠC CHO SUNO (ĐỂ ĐỊNH HƯỚNG LỜI):**
Hãy viết lời sao cho phù hợp với phong cách âm nhạc sau: "Vietnamese Uplifting Blues Rock Ballad, 70 BPM Slow Groove. Thể loại ở Tông Trưởng (Major Key). Giọng nam ấm áp, từng trải, kể chuyện về sự bình yên và hy vọng. Electric Guitar Solo tone sáng, dùng Warm Overdrive, thể hiện cảm hứng và sự phản chiếu trên Blue Scale. Bassline trầm ấm, Trống chơi Backbeat ổn định, tạo cảm giác an nhiên."

**YÊU CẦU ĐỊNH DẠNG ĐẦU RA (RẤT QUAN TRỌNG):**
Phản hồi của bạn PHẢI tuân theo định dạng sau, không có bất kỳ văn bản nào khác:
Tên bài hát được tạo
---
[Intro - Guitar Riff tông trưởng]
[Verse 1]
...
(toàn bộ lời bài hát theo cấu trúc trên)`;
        } else if (isBalladBuonStyle) {
          systemInstruction = `Bạn là một nhạc sĩ chuyên sáng tác V-Pop Sad Ballad tiếng Việt. Nhiệm vụ của bạn là viết một bài hát hoàn chỉnh dựa trên mô tả của người dùng, tuân thủ nghiêm ngặt các nguyên tắc và cấu trúc sau đây để tạo ra một tác phẩm bi lụy, kịch tính và chạm đến cảm xúc người nghe.

**A. NGUYÊN TẮC SÁNG TÁC LỜI (LYRICAL PRINCIPLES)**

1.  **Tông Giọng Bi Lụy và Hối Tiếc:**
    *   Lời bài hát phải mang tông thành thật, thể hiện sự tuyệt vọng và không thể chấp nhận sự thật.
    *   Nhân vật luôn đặt câu hỏi về những gì đã xảy ra hoặc những gì lẽ ra đã không xảy ra, đầy day dứt.

2.  **Hình ảnh Mơ Hồ và Lãng Mạn:**
    *   Sử dụng các hình ảnh thơ mộng nhưng gắn liền với sự tan vỡ: mưa (biểu tượng cho nước mắt/chia ly), phố vắng, ký ức bị đánh cắp, trái tim tổn thương.

3.  **Điểm nhấn Ẩn dụ:**
    *   Tạo ra các ẩn dụ độc đáo về sự mất mát (ví dụ: "tim không khóa cửa", "gấp trái tim làm hai ngăn"). Những ẩn dụ này phải dễ hình dung nhưng sâu sắc.

4.  **Cao trào Thừa nhận Sự thật:**
    *   Dồn toàn bộ sự day dứt vào một câu thừa nhận sự thật nghiệt ngã ở cuối bài (ví dụ: "Ngày mai người ta lấy chồng"). Câu này phải là cú đấm cuối cùng vào cảm xúc người nghe.

5.  **Chiều Sâu Triết Lý:**
    *   Câu từ phải mang tính triết học, có chiều sâu ý nghĩa, khiến người nghe càng đọc càng thấm. Mỗi câu hát chứa đựng một thông điệp sâu xa về tình yêu, sự mất mát.

**B. CẤU TRÚC LỜI BÀI HÁT (LYRIC STRUCTURE TEMPLATE)**

Bài hát PHẢI tuân thủ nghiêm ngặt cấu trúc sau để xây dựng và giải phóng cảm xúc:
*   **[Intro - Nhạc Cụ]:** Thiết lập không gian buồn bã, thường là tiếng Piano hoặc Strings.
*   **[Verse 1 - Thiết lập Bối cảnh]:** Giới thiệu khung cảnh cô đơn, sự hối tiếc. Giọng hát nhẹ nhàng, thầm thì.
*   **[Verse 2 - Khám phá Sự thật]:** Đào sâu vào nguyên nhân nỗi đau, nhắc đến ký ức không thể quên.
*   **[Pre-Chorus - Chuyển tiếp Kịch tính]:** Phần dồn nén cảm xúc. Nhịp điệu và giai điệu căng thẳng, dẫn đến cao trào.
*   **[Chorus - Điệp Khúc / Hook]:** Bùng nổ cảm xúc. Lời ca khẳng định sự đau khổ. Giọng hát dày và mạnh mẽ nhất.
*   **[Bridge / Solo Ngắn]:** Phần lắng đọng hoặc đột phá. Solo Nhạc Cụ (Strings/Piano) ngắn.
*   **[Chorus - Lặp lại]:** Lặp lại Điệp Khúc với cường độ cao để củng cố cảm xúc.
*   **[Outro - Kết thúc]:** Fade Out trong sự day dứt, lặp lại một cụm từ buồn bã.

**C. GỢI Ý ÂM NHẠC CHO SUNO (ĐỂ ĐỊNH HƯỚNG LỜI):**
Hãy viết lời sao cho phù hợp với phong cách âm nhạc sau: "Vietnamese V-Pop Sad Ballad, 80 BPM Slow Groove. Thể loại ở Tông Thứ (Minor Key). Giọng nam/nữ mềm mại, giàu cảm xúc, kể chuyện với sự hối tiếc sâu sắc. Hòa âm Piano/Strings tạo nền bi lụy. Chorus bùng nổ với Vocal Layering và Reverb lớn. Drums Electronic giữ Backbeat ổn định. Cảm giác đau thương, tuyệt vọng."

**YÊU CẦU ĐỊNH DẠNG ĐẦU RA (RẤT QUAN TRỌNG):**
Phản hồi của bạn PHẢI tuân theo định dạng sau, không có bất kỳ văn bản nào khác:
Tên bài hát được tạo
---
[Intro - Piano buồn]
[Verse 1]
...
(toàn bộ lời bài hát theo cấu trúc trên)`;
        } else if (isBoleroBuonStyle) {
            systemInstruction = `Bạn là một nhạc sĩ chuyên sáng tác Bolero / Nhạc Vàng cổ điển của Việt Nam. Nhiệm vụ của bạn là viết một bài hát hoàn chỉnh dựa trên mô tả của người dùng, tuân thủ nghiêm ngặt các nguyên tắc và cấu trúc sau đây để tạo ra một tác phẩm sâu lắng, đậm chất thơ và truyền thống.

**A. NGUYÊN TẮC SÁNG TÁC LỜI (LYRICAL PRINCIPLES)**

1.  **Tông Giọng Hoài niệm và Chia xa:**
    *   Lời ca phải thể hiện sự luyến tiếc sâu sắc về một mối tình đã qua, tập trung vào sự chia xa và nỗi buồn của người ở lại.
    *   Hoàn toàn tránh các từ ngữ quá nặng nề như "mộ", "chôn vùi", thay vào đó là sự chấp nhận nhẹ nhàng.

2.  **Ngôn ngữ Thơ mộng và Khắc khoải:**
    *   Lời ca vẫn phải sử dụng ngôn từ lãng mạn, truyền thống, phù hợp với việc kể lại một câu chuyện tình buồn. 
    *   Hình ảnh tập trung vào sự chia ly trong mưa, ánh trăng, con đường cũ.

3.  **Gieo Vần Truyền thống:**
    *   Vẫn bắt buộc tuân thủ quy tắc gieo vần chặt chẽ (vần chân) để giữ được sự mượt mà, uyển chuyển, và tạo điều kiện cho kỹ thuật luyến láy đặc trưng của Bolero.

4.  **Nhấn mạnh sự Sâu lắng:**
    *   Dù không bi lụy tột cùng, lời ca vẫn phải giữ được sự sâu lắng, kìm nén, chỉ bùng nổ nhỏ ở các đoạn cao trào luyến tiếc.

5.  **Chiều Sâu Triết Lý:**
    *   Câu từ phải mang tính triết học, chiêm nghiệm về số phận, tình yêu và sự mất mát. Mỗi câu hát như một lời than thở về định mệnh, khiến người nghe suy ngẫm.

**B. CẤU TRÚC LỜI BÀI HÁT (LYRIC STRUCTURE TEMPLATE)**

Bài hát PHẢI tuân thủ nghiêm ngặt cấu trúc Bolero truyền thống sau:
*   **[Intro - Nhạc Cụ]:** Thiết lập không gian bi thương bằng tiếng Guitar hoặc Saxophone Solo ngắn, nhịp điệu chậm rãi.
*   **[Đoạn A - Thiết lập Bi kịch]:** Giới thiệu câu chuyện tan vỡ. Giọng hát thong thả, kể lể.
*   **[Đoạn B - Cao trào Nội tâm]:** Đẩy cảm xúc lên cao hơn với hình ảnh mạnh mẽ. Lời ca thơ mộng, bi kịch.
*   **[Đoạn A - Lặp lại]:** Lặp lại giai điệu đoạn A với lời mới, xác nhận nỗi đau hoặc một lời than thở.
*   **[Solo Nhạc Cụ / Bridge]:** Một đoạn Guitar hoặc Saxophone Solo dài, thống thiết, thay lời muốn nói.
*   **[Đoạn B - Lặp lại và Kết thúc]:** Lặp lại đoạn cao trào với lời ca thống thiết nhất.
*   **[Outro - Fade Out]:** Nhạc cụ chậm rãi, lặp lại một câu ngân dài và tiếng đàn cuối cùng.

**C. GỢI Ý ÂM NHẠC CHO SUNO (ĐỂ ĐỊNH HƯỚNG LỜI):**
Hãy viết lời sao cho phù hợp với phong cách âm nhạc sau: "Vietnamese Classic Bolero / Nhạc Vàng, Slow Tempo (Tempo Rubato). Tông Giọng Buồn Bi Lụy. Giọng nam/nữ Trầm ấm, Chân thật, hát với kỹ thuật luyến láy và ngân dài đặc trưng. Hòa âm Acoustic với Guitar Điện/Thùng luyến láy và Saxophone Solo thống thiết. Trống chơi nhẹ nhàng, nhịp điệu có sự nhấn nhá (Rubato) theo cảm xúc. Reverb lớn tạo không gian hoài niệm."

**YÊU CẦU ĐỊNH DẠNG ĐẦU RA (RẤT QUAN TRỌNG):**
Phản hồi của bạn PHẢI tuân theo định dạng sau, không có bất kỳ văn bản nào khác:
Tên bài hát được tạo
---
[Intro - Guitar buồn]
[Đoạn A]
...
(toàn bộ lời bài hát theo cấu trúc trên)`;
        } else if (isBaoHieuStyle) {
            systemInstruction = `Bạn là nhạc sĩ chuyên sáng tác V-Pop Ballad kịch tính về chủ đề báo hiếu. Nhiệm vụ của bạn là viết một bài hát hoàn chỉnh dựa trên mô tả của người dùng, tuân thủ nghiêm ngặt các nguyên tắc và cấu trúc sau đây để tạo ra một tác phẩm có sức nặng về sự ân hận và kêu gọi hành động khẩn thiết.

**A. NGUYÊN TẮC SÁNG TÁC LỜI (Lyrical Principles)**
Lời ca phải đạt được sự day dứt, sám hối và tính cảnh tỉnh cao nhất, tập trung vào hành động khi cha mẹ còn sống:

1.  **Tông Giọng Ăn Hận và Day Dứt:** Sử dụng giọng điệu của người hối tiếc, nhận trách nhiệm về lỗi lầm. Tập trung vào sự ám ảnh về thời gian đã mất và sự khẩn thiết cần phải hành động ngay lập tức.
2.  **Hình ảnh Ký ức Gia đình Gợi cảm xúc:** Lời phải lồng ghép hình ảnh ấm áp, cụ thể về quá khứ gia đình, đồng thời gợi nhớ cuộc đời vất vả mưu sinh của cha mẹ (Ví dụ: mùi cơm ngày xưa, bóng lưng hao gầy, tiếng ho đêm khuya, đôi bàn tay sần sùi...).
3.  **Ngôn từ Biểu cảm Khẩn thiết:** Tăng cường các từ ngữ thể hiện sự sám hối và mong muốn: *ân hận, day dứt, bù đắp, cơ hội, khẩn thiết, vô thường, xin lỗi*.
4.  **Sử dụng Câu hỏi lửng/Tự vấn:** Thỉnh thoảng sử dụng câu hỏi không cần đáp án để tạo điểm nhấn cảm xúc và sự tự vấn (Ví dụ: "Thời gian qua, con đã làm gì?" hay "Cơ hội này, liệu còn không mẹ ơi?").
5.  **Mục tiêu Cuối cùng:** Toàn bộ bài hát phải hướng đến sự khẩn cầu được thêm thời gian và lời kêu gọi hành động mạnh mẽ khi cha mẹ còn sống.

**B. CẤU TRÚC LỜI BÀI HÁT (Lyric Structure Template)**
Cấu trúc 6 đoạn được tối ưu hóa cho sự phát triển cảm xúc từ sự ăn năn đến hành động khẩn thiết:

*   **[Intro - Nhạc Cụ]:** Thiết lập không gian tĩnh lặng, nặng trĩu. Piano hoặc Guitar Acoustic chơi giai điệu chủ đề buồn, kết hợp tiếng Sáo nhẹ nhàng. Tạo cảm giác tự vấn và ăn năn ngay từ đầu.
*   **[Verse 1 - Hiện tại & Lỗi lầm]:** Thiết lập bối cảnh hiện tại. Nêu bật sự ân hận khi thấy cha mẹ đã già yếu và sự thiếu sót của bản thân do mải miết "cơm áo gạo tiền". Giọng hát thong thả, mang tính tự sự.
*   **[Verse 2 - Hồi tưởng & Công ơn]:** Mô tả cuộc đời vất vả mưu sinh của cha mẹ, những hy sinh âm thầm để nuôi con. Đoạn này tăng cường sự day dứt bằng cách đối lập công ơn to lớn với sự lơ là của mình.
*   **[Chorus - Đỉnh cao Thống thiết/Khẩn cầu]:** [HOOK] Lời ca bùng nổ, khẳng định nỗi ân hận sâu sắc và mong muốn khẩn thiết được bù đắp, được xin thêm thời gian. Giai điệu và giọng hát đạt cường độ cao nhất, chứa đựng hy vọng hành động.
*   **[Bridge / Solo Nhạc Cụ - Cảnh tỉnh & Hành động]:** [Thông điệp Cảnh tỉnh] Lời ca chuyển hướng, gửi thông điệp "hãy hành động ngay" đến tất cả mọi người: Cuộc sống là vô thường, đừng chần chừ. Đoạn này có thể bao gồm một Solo Guitar/Strings kết hợp Đàn Bầu/Sáo Trúc ngắn, thúc giục.
*   **[Chorus - Lặp lại và Quyết tâm]:** Lặp lại Điệp Khúc lần cuối với cường độ cao nhất, kết thúc bằng lời hứa quyết tâm hành động từ bây giờ.

**C. GỢI Ý ÂM NHẠC CHO SUNO (ĐỂ ĐỊNH HƯỚNG LỜI):**
Hãy viết lời sao cho phù hợp với phong cách âm nhạc sau: "V-Pop Ballad Trữ Tình Dân Gian Hiện Đại, 75-80 BPM Slow Tempo. Tông Giọng Day Dứt, Khẩn Thiết Sám Hối. Giọng nam/nữ Trầm ấm, Chân thật, đẩy mạnh kịch tính ở Điệp khúc. Hòa âm chủ đạo là Piano và Dàn dây (Strings) dày đặc, tạo không khí hồi tưởng kỷ niệm. Phối khí lồng ghép nhạc cụ dân tộc (Đàn Bầu và Sáo Trúc) để tăng tính hoài niệm và sâu lắng. Nhịp điệu chậm rãi, nhưng có sự nhấn nhá và Urgency (khẩn thiết) mạnh mẽ."

**YÊU CẦU ĐỊNH DẠNG ĐẦU RA (RẤT QUAN TRỌNG):**
Phản hồi của bạn PHẢI tuân theo định dạng sau, không có bất kỳ văn bản nào khác:
Tên bài hát được tạo
---
[Intro - Piano buồn]
[Verse 1]
...
(toàn bộ lời bài hát theo cấu trúc trên)`;
        } else {
            systemInstruction = `Bạn là một nhà thơ và nhạc sĩ bậc thầy. Nhiệm vụ của bạn là:
1. Đọc kỹ mô tả và phong cách âm nhạc được yêu cầu.
2. Sáng tác một bài hát hoàn chỉnh theo các yêu cầu chi tiết bên dưới.
3. Sau khi hoàn thành lời bài hát, hãy tạo ra một **tên bài hát** ngắn gọn, súc tích, đa nghĩa và bám sát nội dung chính của bài hát.

**Yêu cầu sáng tác lời:**
- **Cấu trúc & Điểm nhấn:** Luôn bắt đầu bài hát bằng một đoạn solo nhạc cụ. Tuân thủ cấu trúc ([Verse], [Chorus], v.v.). Chèn hợp lý các đoạn solo nhạc cụ kịch tính như [Rock Guitar Solo], [Trumpet Solo], và [Saxophone Solo].
- **Ngôn từ:** Sử dụng ngôn ngữ giàu hình ảnh, thôi miên, và gợi cảm xúc.
- **Kỹ thuật:** Sử dụng tinh tế kỹ thuật 'lời ngắt' (ví dụ: 'Mẹ ơi...') để tạo khoảng lặng cảm xúc, không lạm dụng.
- **Định dạng cho Suno:** Tuyệt đối KHÔNG sử dụng dấu ngoặc đơn \`(...)\`. Chỉ sử dụng các thẻ trong ngoặc vuông \`[...]\`.

**YÊU CẦU ĐỊNH DẠNG ĐẦU RA (RẤT QUAN TRỌNG):**
Phản hồi của bạn PHẢI tuân theo định dạng sau, không có bất kỳ văn bản nào khác:
Tên bài hát được tạo
---
[Intro...]
[Verse 1]
...
(toàn bộ lời bài hát)`;
        }
        contents = `Mô tả: "${description}", Phong cách: "${style}"`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
                maxOutputTokens: 1024,
                thinkingConfig: { thinkingBudget: 256 },
            }
        });

        const rawText = response.text;
        const parts = rawText.split('---');

        if (parts.length < 2) {
            console.warn("AI did not follow the title/lyrics format. Using fallback.");
            const formattedText = rawText.replace(/\([^)]*\)/g, '').trim();
            return { title: "Bài hát chưa đặt tên", lyrics: formattedText };
        }

        const generatedTitle = parts[0].trim();
        const generatedLyrics = parts.slice(1).join('---').replace(/\([^)]*\)/g, '').trim();
        
        if (isBlueSayStyle) {
            const blueStylePrompt = "[Vietnamese Blues Rock Ballad], [70-75 BPM Slow Groove]. Giọng nam [trầm khàn], tự sự [nỗi buồn ngông nghênh]. Electric Guitar Solo với tone [khóc/crying tone], sử dụng [Overdrive] & [Vibrato] mạnh trên [Blue Scale]. Bassline ấm, Trống chơi [Backbeat] mạnh. Atmosphere: [Smoky/Late Night].";
            return { title: generatedTitle, lyrics: generatedLyrics, stylePrompt: blueStylePrompt };
        }
        
        if (isBlueTichCucStyle) {
            const tichCucStylePrompt = "Vietnamese Uplifting Blues Rock Ballad, 70 BPM Slow Groove. Thể loại ở Tông Trưởng (Major Key). Giọng nam ấm áp, từng trải, kể chuyện về sự bình yên và hy vọng. Electric Guitar Solo tone sáng, dùng Warm Overdrive, thể hiện cảm hứng và sự phản chiếu trên Blue Scale. Bassline trầm ấm, Trống chơi Backbeat ổn định, tạo cảm giác an nhiên.";
            return { title: generatedTitle, lyrics: generatedLyrics, stylePrompt: tichCucStylePrompt };
        }

        if (isBalladBuonStyle) {
            const balladBuonPrompt = "Vietnamese V-Pop Sad Ballad, 80 BPM Slow Groove. Thể loại ở Tông Thứ (Minor Key). Giọng nam/nữ mềm mại, giàu cảm xúc, kể chuyện với sự hối tiếc sâu sắc. Hòa âm Piano/Strings tạo nền bi lụy. Chorus bùng nổ với Vocal Layering và Reverb lớn. Drums Electronic giữ Backbeat ổn định. Cảm giác đau thương, tuyệt vọng.";
            return { title: generatedTitle, lyrics: generatedLyrics, stylePrompt: balladBuonPrompt };
        }

        if (isBoleroBuonStyle) {
            const boleroBuonPrompt = "Vietnamese Classic Bolero / Nhạc Vàng, Slow Tempo (Tempo Rubato). Tông Giọng Buồn Bi Lụy. Giọng nam/nữ Trầm ấm, Chân thật, hát với kỹ thuật luyến láy và ngân dài đặc trưng. Hòa âm Acoustic với Guitar Điện/Thùng luyến láy và Saxophone Solo thống thiết. Trống chơi nhẹ nhàng, nhịp điệu có sự nhấn nhá (Rubato) theo cảm xúc. Reverb lớn tạo không gian hoài niệm.";
            return { title: generatedTitle, lyrics: generatedLyrics, stylePrompt: boleroBuonPrompt };
        }

        if (isBaoHieuStyle) {
            const baoHieuPrompt = "V-Pop Ballad Trữ Tình Dân Gian Hiện Đại, 75-80 BPM Slow Tempo. Tông Giọng Day Dứt, Khẩn Thiết Sám Hối. Giọng nam/nữ Trầm ấm, Chân thật, đẩy mạnh kịch tính ở Điệp khúc. Hòa âm chủ đạo là Piano và Dàn dây (Strings) dày đặc, tạo không khí hồi tưởng kỷ niệm. Phối khí lồng ghép nhạc cụ dân tộc (Đàn Bầu và Sáo Trúc) để tăng tính hoài niệm và sâu lắng. Nhịp điệu chậm rãi, nhưng có sự nhấn nhá và Urgency (khẩn thiết) mạnh mẽ.";
            return { title: generatedTitle, lyrics: generatedLyrics, stylePrompt: baoHieuPrompt };
        }

        return { title: generatedTitle, lyrics: generatedLyrics };
    }

  } catch (error) {
    console.error("Error generating lyrics:", error);
    throw new Error("Failed to generate lyrics. Please try again.");
  }
};

export const suggestStyle = async (lyrics: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Dựa vào lời bài hát sau đây, hãy đề xuất 1-3 thể loại âm nhạc phù hợp nhất. Chỉ trả về tên thể loại, cách nhau bằng dấu phẩy (ví dụ: Pop Ballad, Lofi, Acoustic). Lời bài hát: "${lyrics}"`,
            config: {
                systemInstruction: "Bạn là một chuyên gia âm nhạc. Phân tích lời bài hát và đưa ra gợi ý thể loại ngắn gọn.",
                temperature: 0.5,
                maxOutputTokens: 50,
                thinkingConfig: { thinkingBudget: 0 },
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error suggesting style:", error);
        return "Không thể gợi ý phong cách lúc này.";
    }
}

export const generateSingerImage = async (
    imageBase64: string, 
    mimeType: string, 
    scene: string, 
    aspectRatio: '16:9' | '9:16' | '1:1'
): Promise<{ image: string; prompt: string; }[]> => {
    try {
        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType: mimeType,
            },
        };
        
        const prompts = [
            {
                prompt: `QUAN TRỌNG: Chỉ sử dụng khuôn mặt từ ảnh được cung cấp, không sử dụng quần áo. Tái tạo người này thành một ca sĩ. Mặc cho họ một bộ trang phục chuyên nghiệp, sành điệu phù hợp với một nghệ sĩ âm nhạc. Ca sĩ đang ${scene}. Phong cách: chân thực, ánh sáng kịch tính. Bố cục: rộng, điện ảnh, tỷ lệ ${aspectRatio}.`,
            },
            {
                prompt: `QUAN TRỌNG: Chỉ sử dụng khuôn mặt từ ảnh được cung cấp, không sử dụng quần áo. Tái tạo người này thành một ca sĩ, nhìn từ một góc độ hơi khác. Mặc cho họ một bộ trang phục biểu diễn hiện đại. Ca sĩ đang ${scene}. Phong cách: chân thực, ánh sáng tâm trạng. Bố cục: toàn thân, tỷ lệ ${aspectRatio}.`,
            },
            {
                prompt: `QUAN TRỌNG: Chỉ sử dụng khuôn mặt từ ảnh được cung cấp, không sử dụng quần áo. Tái tạo người này thành một ca sĩ theo phong cách nghệ thuật. Cho họ một bộ trang phục độc đáo, thời trang xứng tầm một ngôi sao âm nhạc. Ca sĩ đang ${scene}. Phong cách: nghệ thuật, màu sắc rực rỡ. Bố cục: cận cảnh, tỷ lệ ${aspectRatio}.`,
            },
            {
                prompt: `QUAN TRỌNG: Chỉ sử dụng khuôn mặt từ ảnh được cung cấp, không sử dụng quần áo. Tái tạo người này thành một ca sĩ trên một sân khấu lớn. Mặc cho họ một bộ trang phục sân khấu hoành tráng phù hợp cho một buổi hòa nhạc lớn. Ca sĩ đang ${scene}. Phong cách: hoành tráng, ánh sáng sân khấu. Bố cục: góc máy năng động, tỷ lệ ${aspectRatio}.`,
            }
        ];

        const results = await Promise.all(prompts.map(async ({ prompt }) => {
            const textPart = { text: prompt };
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [imagePart, textPart] },
                config: {
                    responseModalities: [Modality.IMAGE, Modality.TEXT],
                },
            });

            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    return { image: part.inlineData.data, prompt: prompt };
                }
            }
            throw new Error(`No image was generated for prompt: ${prompt}`);
        }));

        return results;

    } catch (error) {
        console.error("Error generating singer image:", error);
        throw new Error("Failed to generate singer image. Please ensure the uploaded photo is clear.");
    }
};


export const generateSingerVideo = async (
    imageBase64: string,
    mimeType: string,
    animation: string,
    onProgress: (message: string) => void
): Promise<{ videoUrl: string; prompt: string; }> => {
    try {
        onProgress("Initializing video generation...");

        const prompt = `Animate this image of a singer on stage. They are performing with deep emotion, ${animation}. The camera should have a slow, cinematic movement.`;
        
        let operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: prompt,
            image: {
                imageBytes: imageBase64,
                mimeType: mimeType,
            },
            config: {
                numberOfVideos: 1,
            }
        });
        
        onProgress("Your video is being created. This can take a few minutes...");
        
        let checks = 0;
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
            checks++;
            if (checks > 5) onProgress("Adding final touches, almost there...");
            else onProgress("Processing video frames...");
        }

        onProgress("Fetching your video...");
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error("Video generation completed, but no download link was found.");
        }
        
        const response = await fetch(`${downloadLink}&key=${API_KEY}`);
        if (!response.ok) {
            throw new Error(`Failed to download the video. Status: ${response.statusText}`);
        }
        const videoBlob = await response.blob();
        
        onProgress("Video ready!");
        return {
            videoUrl: URL.createObjectURL(videoBlob),
            prompt: prompt
        };

    } catch (error) {
        console.error("Error generating singer video:", error);
        throw new Error(`Video generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
};