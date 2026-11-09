import type { Locale } from '@/core/i18n/config';

/** Một bước trong tuyến bài học, dẫn tới một sự kiện đã có trong kho dữ liệu. */
export interface CollectionStep {
  /** Khóa đường dẫn của sự kiện. */
  slug: string;
  /** Ghi chú dẫn dắt tiếng Việt, đặt sự kiện vào mạch của tuyến. */
  noteVi: string;
  /** Ghi chú dẫn dắt tiếng Anh. */
  noteEn: string;
}

/** Một tuyến bài học: chuỗi sự kiện được tuyển chọn theo một mạch chủ đề. */
export interface Collection {
  /** Khóa đường dẫn của tuyến. */
  slug: string;
  /** Tiêu đề tiếng Việt. */
  titleVi: string;
  /** Tiêu đề tiếng Anh. */
  titleEn: string;
  /** Lời mở đầu biên tập tiếng Việt. */
  introVi: string;
  /** Lời mở đầu biên tập tiếng Anh. */
  introEn: string;
  /** Các bước theo thứ tự đọc. */
  steps: CollectionStep[];
}

/**
 * Sáu tuyến bài học chính của website.
 * Mọi khóa sự kiện đều có trong kho dữ liệu dùng chung; kiểm thử tự động sẽ
 * xác nhận lại để tuyến không bao giờ dẫn tới bài viết không tồn tại.
 */
export const collections: Collection[] = [
  {
    slug: 'nguon-coi-quoc-gia',
    titleVi: 'Nguồn cội quốc gia',
    titleEn: 'The roots of the nation',
    introVi:
      'Từ truyền thuyết Hùng Vương tới nhà nước Đại Cồ Việt, tuyến này đi qua những mốc hình thành dân tộc: các nhà nước đầu tiên, những cuộc khởi nghĩa giành lại độc lập và chiến thắng Bạch Đằng chấm dứt nghìn năm Bắc thuộc.',
    introEn:
      'From the Hung Kings legend to the state of Dai Co Viet, this path follows the milestones of nation-building: the first states, the uprisings that reclaimed independence, and the Battle of Bach Dang that ended a thousand years of Chinese rule.',
    steps: [
      {
        slug: 'nha-nuoc-van-lang',
        noteVi: 'Khởi đầu từ nhà nước đầu tiên ghi trong truyền thống dân tộc.',
        noteEn: 'Begins with the first state recorded in Vietnamese tradition.',
      },
      {
        slug: 'au-lac-an-duong-vuong',
        noteVi: 'Nhà nước thứ hai nối tiếp Văn Lang với thành Cổ Loa kiên cố.',
        noteEn: 'The second state succeeds Van Lang with the walled city of Co Loa.',
      },
      {
        slug: 'khoi-nghia-hai-ba-trung',
        noteVi: 'Cuộc khởi nghĩa đầu tiên giành lại chủ quyền từ tay đô hộ.',
        noteEn: 'The first uprising to reclaim sovereignty from the occupiers.',
      },
      {
        slug: 'khoi-nghia-ly-bi-542',
        noteVi: 'Lý Bí dựng nước Vạn Xuân, nêu khát vọng trường tồn của dân tộc.',
        noteEn: 'Ly Bi founds Van Xuan, voicing the people’s wish to endure.',
      },
      {
        slug: 'chien-thang-bach-dang-938',
        noteVi: 'Ngô Quyền phá quân Nam Hán, chính thức chấm dứt thời Bắc thuộc.',
        noteEn: 'Ngo Quyen defeats the Southern Han and ends the Chinese domination.',
      },
      {
        slug: 'le-dai-hanh-khang-tong-981',
        noteVi: 'Lê Đại Hành giữ vững nền độc lập non trẻ trước nhà Tống.',
        noteEn: 'Le Dai Hanh defends the young independence against the Song.',
      },
    ],
  },
  {
    slug: 'dai-viet-nghin-nam-doc-lap',
    titleVi: 'Đại Việt: một nghìn năm độc lập',
    titleEn: 'Dai Viet: a thousand years of independence',
    introVi:
      'Sau Bạch Đằng, nước Đại Việt bước vào thời kỳ tự chủ lâu dài. Tuyến này dẫn qua các triều đại lớn: dời đô mở vận thế mới, ba lần đánh bại Nguyên Mông, khởi nghĩa Lam Sơn và bộ luật Hồng Đức của thời thịnh trị.',
    introEn:
      'After Bach Dang, Dai Viet entered a long era of self-rule. This path walks through the great dynasties: the move of the capital, three victories over the Mongols, the Lam Son uprising and the Hong Duc code of a golden age.',
    steps: [
      {
        slug: 'dai-co-viet-doi-do-thang-long',
        noteVi: 'Lý Thái Tổ dời đô về Thăng Long, mở ra thời kỳ phát triển mới.',
        noteEn: 'Ly Thai To moves the capital to Thang Long, opening a new age.',
      },
      {
        slug: 'chien-thang-nhu-nguyet-1077',
        noteVi: 'Phòng tuyến Như Nguyệt chặn đứng cuộc xâm lược đầu tiên của nhà Tống.',
        noteEn: 'The Nhu Nguyet line stops the first Song invasion.',
      },
      {
        slug: 'ba-lan-khang-nguyen-mong',
        noteVi: 'Ba lần kháng chiến đánh bại đội quân hùng mạnh nhất thế giới đương thời.',
        noteEn: 'Three wars defeat the strongest army of the age.',
      },
      {
        slug: 'khoi-nghia-lam-son',
        noteVi: 'Lê Lợi dựng cờ khởi nghĩa, kết thúc bằng Bình Ngô đại cáo.',
        noteEn: 'Le Loi raises the banner of Lam Son, ending with the Proclamation of Victory.',
      },
      {
        slug: 'chien-thang-chi-lang-xuong-giang-1427',
        noteVi: 'Chi Lăng – Xương Giang quét sạch quân Minh, khép lại khởi nghĩa Lam Sơn.',
        noteEn: 'Chi Lang – Xuong Giang sweeps away the Ming army and closes the uprising.',
      },
      {
        slug: 'luat-hong-duc-1483',
        noteVi: 'Bộ luật Hồng Đức đánh dấu đỉnh cao tổ chức nhà nước thời Lê sơ.',
        noteEn: 'The Hong Duc code marks the peak of Le dynasty statecraft.',
      },
    ],
  },
  {
    slug: 'nhung-cuoc-cach-mang-lon',
    titleVi: 'Những cuộc cách mạng làm thay đổi thế giới',
    titleEn: 'Revolutions that changed the world',
    introVi:
      'Từ cuối thế kỷ XVIII, các cuộc cách mạng lần lượt định hình lại chính trị thế giới. Tuyến này đặt cạnh nhau Cách mạng Pháp, cách mạng của người nô lệ ở Haiti, Cách mạng Tân Hợi, Cách mạng Tháng Mười Nga, Cách mạng Tháng Tám và Cách mạng Cuba.',
    introEn:
      'From the late 18th century, revolutions reshaped world politics one after another. This path places side by side the French Revolution, the slave revolution of Haiti, the 1911 Chinese Revolution, the Russian October Revolution, the August Revolution and the Cuban Revolution.',
    steps: [
      {
        slug: 'cach-mang-phap-1789',
        noteVi: 'Cách mạng Pháp tuyên bố các quyền phổ quát, làm rung chuyển chế độ quân chủ châu Âu.',
        noteEn: 'The French Revolution proclaims universal rights and shakes European monarchy.',
      },
      {
        slug: 'cach-mang-haiti-1791',
        noteVi: 'Cuộc nổi dậy của người nô lệ lập nên nhà nước độc lập đầu tiên ở Mỹ Latinh.',
        noteEn: 'The slave uprising founds the first independent state in Latin America.',
      },
      {
        slug: 'cach-mang-tan-hoi-1911',
        noteVi: 'Cách mạng Tân Hợi chấm dứt hơn hai nghìn năm hoàng đế ở Trung Quốc.',
        noteEn: 'The 1911 Revolution ends two millennia of imperial rule in China.',
      },
      {
        slug: 'cach-mang-thang-muoi-nga-1917',
        noteVi: 'Cách mạng Tháng Mười đưa những người Bolshevik lên nắm quyền ở Nga.',
        noteEn: 'The October Revolution brings the Bolsheviks to power in Russia.',
      },
      {
        slug: 'cach-mang-thang-tam-1945',
        noteVi: 'Cách mạng Tháng Tám giành chính quyền, khai sinh nước Việt Nam Dân chủ Cộng hòa.',
        noteEn: 'The August Revolution seizes power and founds the Democratic Republic of Vietnam.',
      },
      {
        slug: 'cach-mang-cuba-1959',
        noteVi: 'Cách mạng Cuba lật đổ chế độ Batista, thay đổi cán cân chính trị Tây bán cầu.',
        noteEn: 'The Cuban Revolution overthrows Batista and shifts the Western Hemisphere.',
      },
    ],
  },
  {
    slug: 'chien-tranh-lanh',
    titleVi: 'Chiến tranh Lạnh: từ Thế chiến II đến bức tường sụp đổ',
    titleEn: 'The Cold War: from World War II to the fall of the Wall',
    introVi:
      'Sau năm 1945, thế giới chia hai cực. Tuyến này đi từ hồi kết của Thế chiến II, qua kỷ nguyên hạt nhân, bức tường Berlin và khủng hoảng tên lửa Cuba, tới khi bức tường sụp đổ và Liên Xô tan rã.',
    introEn:
      'After 1945 the world split into two poles. This path runs from the end of World War II, through the nuclear age, the Berlin Wall and the Cuban Missile Crisis, to the fall of the Wall and the dissolution of the Soviet Union.',
    steps: [
      {
        slug: 'the-chien-thu-hai',
        noteVi: 'Thế chiến II tàn phá châu Âu và đặt nền cho trật tự hai cực.',
        noteEn: 'World War II devastates Europe and lays the ground for a bipolar order.',
      },
      {
        slug: 'hiroshima-1945',
        noteVi: 'Hai quả bom nguyên tử mở ra kỷ nguyên hạt nhân của Chiến tranh Lạnh.',
        noteEn: 'Two atomic bombs open the nuclear age of the Cold War.',
      },
      {
        slug: 'lien-hop-quoc-1945',
        noteVi: 'Liên Hợp Quốc ra đời với hy vọng ngăn chặn một cuộc chiến tranh thế giới mới.',
        noteEn: 'The United Nations is founded to prevent another world war.',
      },
      {
        slug: 'buc-tuong-berlin-xay-1961',
        noteVi: 'Bức tường Berlin thành biểu tượng của châu Âu bị chia cắt.',
        noteEn: 'The Berlin Wall becomes the symbol of a divided Europe.',
      },
      {
        slug: 'cuba-khung-hoang-ten-lua-1962',
        noteVi: 'Khủng hoảng tên lửa Cuba đẩy hai siêu cường tới bờ vực chiến tranh hạt nhân.',
        noteEn: 'The Cuban Missile Crisis brings the superpowers to the brink.',
      },
      {
        slug: 'buc-tuong-berlin-1989',
        noteVi: 'Bức tường sụp đổ, mở đầu cho sự kết thúc của Chiến tranh Lạnh.',
        noteEn: 'The Wall falls, opening the end of the Cold War.',
      },
      {
        slug: 'thong-nhat-duc-1990',
        noteVi: 'Nước Đức thống nhất chỉ một năm sau khi bức tường sụp đổ.',
        noteEn: 'Germany reunites one year after the Wall falls.',
      },
      {
        slug: 'sap-do-lien-xo-1991',
        noteVi: 'Liên Xô tan rã, khép lại trật tự hai cực.',
        noteEn: 'The Soviet Union dissolves, closing the bipolar order.',
      },
    ],
  },
  {
    slug: 'viet-nam-hien-dai',
    titleVi: 'Việt Nam từ độc lập đến hội nhập',
    titleEn: 'Vietnam from independence to integration',
    introVi:
      'Từ Tuyên ngôn Độc lập 1945 tới khi gia nhập WTO, tuyến này kể hành trình Việt Nam đi qua các cuộc chiến tranh, thống nhất đất nước, Đổi mới và hội nhập quốc tế.',
    introEn:
      'From the 1945 Declaration of Independence to WTO membership, this path tells Vietnam’s journey through war, reunification, Doi Moi and international integration.',
    steps: [
      {
        slug: 'cach-mang-thang-tam-1945',
        noteVi: 'Tuyên ngôn Độc lập khai sinh nước Việt Nam Dân chủ Cộng hòa.',
        noteEn: 'The Declaration of Independence founds the Democratic Republic of Vietnam.',
      },
      {
        slug: 'chien-dich-dien-bien-phu',
        noteVi: 'Chiến thắng Điện Biên Phủ buộc Pháp rời Đông Dương.',
        noteEn: 'Dien Bien Phu forces France out of Indochina.',
      },
      {
        slug: 'hiep-dinh-geneve-1954',
        noteVi: 'Hiệp định Genève chia cắt tạm thời hai miền tại vĩ tuyến 17.',
        noteEn: 'The Geneva Accords temporarily divide the country at the 17th parallel.',
      },
      {
        slug: 'tet-mau-than-1968',
        noteVi: 'Tết Mậu Thân làm xoay chuyển cục diện chiến tranh.',
        noteEn: 'The Tet Offensive shifts the course of the war.',
      },
      {
        slug: 'hiep-dinh-paris-1973',
        noteVi: 'Hiệp định Paris mở đường cho quân Mỹ rút khỏi miền Nam.',
        noteEn: 'The Paris Accords open the way for the US withdrawal.',
      },
      {
        slug: 'dai-thang-mua-xuan-1975',
        noteVi: 'Đại thắng mùa xuân thống nhất đất nước.',
        noteEn: 'The Spring Victory reunifies the country.',
      },
      {
        slug: 'doi-moi-1986',
        noteVi: 'Đổi mới đưa Việt Nam thoát khỏi khủng hoảng kinh tế.',
        noteEn: 'Doi Moi lifts Vietnam out of economic crisis.',
      },
      {
        slug: 'binh-thuong-hoa-viet-my-1995',
        noteVi: 'Bình thường hóa quan hệ Việt – Mỹ mở ra thời kỳ hội nhập.',
        noteEn: 'Normalization with the US opens the era of integration.',
      },
      {
        slug: 'viet-nam-gia-nhap-asean',
        noteVi: 'Gia nhập ASEAN đưa Việt Nam vào cộng đồng khu vực.',
        noteEn: 'Joining ASEAN brings Vietnam into the regional community.',
      },
      {
        slug: 'viet-nam-gia-nhap-wto-2007',
        noteVi: 'Gia nhập WTO đánh dấu hội nhập toàn cầu đầy đủ.',
        noteEn: 'WTO membership marks full global integration.',
      },
    ],
  },
  {
    slug: 'phat-minh-dinh-hinh-the-gioi',
    titleVi: 'Những phát minh định hình thế giới',
    titleEn: 'Inventions that shaped the world',
    introVi:
      'Máy in, thuyết nhật tâm, động cơ hơi nước, kênh đào, tên lửa vũ trụ và mạng toàn cầu: tuyến này nối những phát minh làm thay đổi cách con người đọc, nghĩ, đi lại và kết nối.',
    introEn:
      'The printing press, heliocentrism, the steam engine, canals, space rockets and the World Wide Web: this path links the inventions that changed how people read, think, travel and connect.',
    steps: [
      {
        slug: 'gutenberg-1440',
        noteVi: 'Máy in chữ rời nhân bản tri thức với tốc độ chưa từng có.',
        noteEn: 'Movable type reproduces knowledge at unprecedented speed.',
      },
      {
        slug: 'thuyet-nhat-tam-1543',
        noteVi: 'Copernicus đặt Mặt Trời vào trung tâm, mở đầu cách mạng khoa học.',
        noteEn: 'Copernicus places the Sun at the center, opening the scientific revolution.',
      },
      {
        slug: 'cong-nghiep-hoa-anh-1760',
        noteVi: 'Cách mạng công nghiệp khởi phát từ động cơ hơi nước và nhà máy.',
        noteEn: 'The Industrial Revolution rises on steam power and factories.',
      },
      {
        slug: 'kenh-suez-1869',
        noteVi: 'Kênh Suez rút ngắn đường biển giữa châu Âu và châu Á.',
        noteEn: 'The Suez Canal shortens the sea route between Europe and Asia.',
      },
      {
        slug: 'kenh-dao-panama-1914',
        noteVi: 'Kênh đào Panama nối liền Đại Tây Dương và Thái Bình Dương.',
        noteEn: 'The Panama Canal links the Atlantic and the Pacific.',
      },
      {
        slug: 'sputnik-1957',
        noteVi: 'Sputnik mở ra kỷ nguyên vũ trụ của loài người.',
        noteEn: 'Sputnik opens the space age for humanity.',
      },
      {
        slug: 'vostok-1-gagarin-1961',
        noteVi: 'Gagarin là người đầu tiên bay vào vũ trụ.',
        noteEn: 'Gagarin becomes the first human in space.',
      },
      {
        slug: 'apollo-11-1969',
        noteVi: 'Con người lần đầu đặt chân lên Mặt Trăng.',
        noteEn: 'Humans first set foot on the Moon.',
      },
      {
        slug: 'world-wide-web-1991',
        noteVi: 'World Wide Web biến Internet thành không gian thông tin của mọi người.',
        noteEn: 'The World Wide Web turns the Internet into a space for everyone.',
      },
      {
        slug: 'chatgpt-ra-mat-2022',
        noteVi: 'Trí tuệ nhân tạo hội thoại tới tay hàng trăm triệu người chỉ trong vài tháng.',
        noteEn: 'Conversational AI reaches hundreds of millions within months.',
      },
    ],
  },
];

/** Bản đồ tuyến theo khóa đường dẫn. */
export const collectionBySlug = new Map(collections.map((collection) => [collection.slug, collection]));

/**
 * Đọc tiêu đề của một tuyến theo ngôn ngữ.
 * @param collection Tuyến bài học.
 * @param locale Ngôn ngữ hiện tại.
 * @returns Tiêu đề đã bản địa hóa.
 */
export function collectionTitle(collection: Collection, locale: Locale): string {
  return locale === 'en' ? collection.titleEn : collection.titleVi;
}

/**
 * Đọc lời mở đầu của một tuyến theo ngôn ngữ.
 * @param collection Tuyến bài học.
 * @param locale Ngôn ngữ hiện tại.
 * @returns Lời mở đầu đã bản địa hóa.
 */
export function collectionIntro(collection: Collection, locale: Locale): string {
  return locale === 'en' ? collection.introEn : collection.introVi;
}

/**
 * Đọc ghi chú dẫn dắt của một bước theo ngôn ngữ.
 * @param step Bước trong tuyến.
 * @param locale Ngôn ngữ hiện tại.
 * @returns Ghi chú đã bản địa hóa.
 */
export function stepNote(step: CollectionStep, locale: Locale): string {
  return locale === 'en' ? step.noteEn : step.noteVi;
}

/**
 * Tạo đường dẫn nội bộ của một tuyến.
 * @param collection Tuyến bài học.
 * @returns Đường dẫn như /collections/nguon-coi-quoc-gia.
 */
export function collectionPath(collection: Collection): string {
  return `/collections/${collection.slug}`;
}
