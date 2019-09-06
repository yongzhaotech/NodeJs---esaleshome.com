'use strict';
const content = {
	all_provinces: {"1":{"name_en":"Alberta","name_cn":"艾伯塔省"},"2":{"name_en":"British Columbia","name_cn":"不列颠哥伦比亚省"},"3":{"name_en":"Manitoba","name_cn":"曼尼托巴省"},"4":{"name_en":"New Brunswick","name_cn":"新不伦瑞克省"},"5":{"name_en":"Newfoundland and Labrador","name_cn":"纽芬兰和拉布拉多"},"6":{"name_en":"Northwest Territories","name_cn":"西北地区"},"7":{"name_en":"Nova Scotia","name_cn":"新斯科舍省"},"8":{"name_en":"Nunavut","name_cn":"努纳武特省"},"9":{"name_en":"Ontario","name_cn":"安大略省"},"10":{"name_en":"Prince Edward Island","name_cn":"爱德华王子岛"},"11":{"name_en":"Quebec","name_cn":"魁北克"},"12":{"name_en":"Saskatchewan","name_cn":"萨斯喀彻温省"},"13":{"name_en":"Yukon","name_cn":"育空"},"14":{"name_en":"Alabama","name_cn":"阿拉巴马州"},"15":{"name_en":"Alaska","name_cn":"阿拉斯加"},"16":{"name_en":"Arizona","name_cn":"亚利桑那州"},"17":{"name_en":"Arkansas","name_cn":"阿肯色州"},"18":{"name_en":"California","name_cn":"加州"},"19":{"name_en":"Colorado","name_cn":"科罗拉多州"},"20":{"name_en":"Connecticut","name_cn":"康涅狄格"},"21":{"name_en":"Delaware","name_cn":"特拉华州"},"22":{"name_en":"Florida","name_cn":"佛罗里达州"},"23":{"name_en":"Georgia","name_cn":"格鲁吉亚"},"24":{"name_en":"Hawaii","name_cn":"夏威夷"},"25":{"name_en":"Idaho","name_cn":"爱达荷州"},"26":{"name_en":"Illinois","name_cn":"伊利诺伊州"},"27":{"name_en":"Indiana","name_cn":"印第安纳州"},"28":{"name_en":"Iowa","name_cn":"爱荷华州"},"29":{"name_en":"Kansas","name_cn":"堪萨斯州"},"30":{"name_en":"Kentucky","name_cn":"肯塔基州"},"31":{"name_en":"Louisiana","name_cn":"路易斯安那州"},"32":{"name_en":"Maine","name_cn":"缅因州"},"33":{"name_en":"Maryland","name_cn":"马里兰州"},"34":{"name_en":"Massachusetts","name_cn":"马萨诸塞州"},"35":{"name_en":"Michigan","name_cn":"密西根州"},"36":{"name_en":"Minnesota","name_cn":"明尼苏达州"},"37":{"name_en":"Mississippi","name_cn":"密西西比州"},"38":{"name_en":"Missouri","name_cn":"密苏里州"},"39":{"name_en":"Montana","name_cn":"蒙大拿州"},"40":{"name_en":"Nebraska","name_cn":"内布拉斯加"},"41":{"name_en":"Nevada","name_cn":"内华达州"},"42":{"name_en":"New Hampshire","name_cn":"新罕布什尔州"},"43":{"name_en":"New Jersey","name_cn":"新泽西州"},"44":{"name_en":"New Mexico","name_cn":"新墨西哥州"},"45":{"name_en":"New York","name_cn":"纽约州"},"46":{"name_en":"North Carolina","name_cn":"北卡罗来纳州"},"47":{"name_en":"North Dakota","name_cn":"北达科他州"},"48":{"name_en":"Ohio","name_cn":"俄亥俄州"},"49":{"name_en":"Oklahoma","name_cn":"俄克拉荷马州"},"50":{"name_en":"Oregon","name_cn":"俄勒冈州"},"51":{"name_en":"Pennsylvania","name_cn":"宾夕法尼亚州"},"52":{"name_en":"Rhode Island","name_cn":"罗德岛"},"53":{"name_en":"South Carolina","name_cn":"南卡罗来纳州"},"54":{"name_en":"South Dakota","name_cn":"南达科他州"},"55":{"name_en":"Tennessee","name_cn":"田纳西州"},"56":{"name_en":"Texas","name_cn":"得克萨斯州"},"57":{"name_en":"Utah","name_cn":"犹他州"},"58":{"name_en":"Vermont","name_cn":"佛蒙特州"},"59":{"name_en":"Virginia","name_cn":"弗吉尼亚州"},"60":{"name_en":"Washington","name_cn":"华盛顿"},"61":{"name_en":"West Virginia","name_cn":"西弗吉尼亚州"},"62":{"name_en":"Wisconsin","name_cn":"威斯康星州"},"63":{"name_en":"Wyoming","name_cn":"怀俄明州"}},
	all_cities: {"1":{"name_en":"Airdrie","name_cn":"艾尔德里"},"2":{"name_en":"Brooks","name_cn":"布鲁克斯"},"3":{"name_en":"Calgary","name_cn":"卡尔加里"},"4":{"name_en":"Camrose","name_cn":"卡姆罗斯"},"5":{"name_en":"Chestermere","name_cn":"切斯特米尔"},"6":{"name_en":"Cold Lake","name_cn":"冷湖"},"7":{"name_en":"Edmonton","name_cn":"埃德蒙顿"},"8":{"name_en":"Fort Saskatchewan","name_cn":"萨斯喀彻温堡"},"9":{"name_en":"Grande Prairie","name_cn":"大草原"},"10":{"name_en":"Lacombe","name_cn":"拉孔贝"},"11":{"name_en":"Leduc","name_cn":"勒杜克"},"12":{"name_en":"Lethbridge","name_cn":"莱斯布里奇"},"13":{"name_en":"Lloydminster","name_cn":"劳埃德明斯特"},"14":{"name_en":"Medicine Hat","name_cn":"梅迪辛哈特"},"15":{"name_en":"Red Deer","name_cn":"马鹿"},"16":{"name_en":"Spruce Grove","name_cn":"斯布塞格路夫"},"17":{"name_en":"St. Albert","name_cn":"圣阿尔伯特"},"18":{"name_en":"Wetaskiwin","name_cn":"韦塔斯基温"},"19":{"name_en":"Abbotsford","name_cn":"阿伯茨福德"},"20":{"name_en":"Armstrong","name_cn":"阿姆斯特朗"},"21":{"name_en":"Burnaby","name_cn":"本拿比"},"22":{"name_en":"Campbell River","name_cn":"坎贝尔河"},"23":{"name_en":"Castlegar","name_cn":"卡斯尔加"},"24":{"name_en":"Chilliwack","name_cn":"吉利瓦克"},"25":{"name_en":"Colwood","name_cn":"高伍德"},"26":{"name_en":"Coquitlam","name_cn":"高贵林"},"27":{"name_en":"Courtenay","name_cn":"库特尼"},"28":{"name_en":"Cranbrook","name_cn":"克兰布鲁克"},"29":{"name_en":"Dawson Creek","name_cn":"道森溪"},"30":{"name_en":"Duncan","name_cn":"邓肯"},"31":{"name_en":"Enderby","name_cn":"恩德比"},"32":{"name_en":"Fernie","name_cn":"费尼"},"33":{"name_en":"Fort St. John","name_cn":"圣约翰堡"},"34":{"name_en":"Grand Forks","name_cn":"大福克斯"},"35":{"name_en":"Greenwood","name_cn":"格林伍德"},"36":{"name_en":"Kamloops","name_cn":"坎卢普斯"},"37":{"name_en":"Kelowna","name_cn":"基隆拿"},"38":{"name_en":"Kimberley","name_cn":"金伯利"},"39":{"name_en":"Langford","name_cn":"兰福德"},"40":{"name_en":"Langley","name_cn":"兰利"},"41":{"name_en":"Maple Ridge","name_cn":"枫树岭"},"42":{"name_en":"Merritt","name_cn":"梅里特"},"43":{"name_en":"Nanaimo","name_cn":"纳奈莫"},"44":{"name_en":"Nelson","name_cn":"纳尔逊"},"45":{"name_en":"New Westminster","name_cn":"新威斯敏斯特"},"46":{"name_en":"North Vancouver","name_cn":"北温哥华"},"47":{"name_en":"Parksville","name_cn":"帕克斯维尔"},"48":{"name_en":"Penticton","name_cn":"彭尼克顿"},"49":{"name_en":"Pitt Meadows","name_cn":"皮特草甸"},"50":{"name_en":"Port Alberni","name_cn":"阿尔伯尼港"},"51":{"name_en":"Port Coquitlam","name_cn":"高贵林港"},"52":{"name_en":"Port Moody","name_cn":"穆迪港"},"53":{"name_en":"Powell River","name_cn":"鲍威尔河"},"54":{"name_en":"Prince George","name_cn":"乔治王子"},"55":{"name_en":"Prince Rupert","name_cn":"鲁珀特王子"},"56":{"name_en":"Quesnel","name_cn":"克内尔"},"57":{"name_en":"Revelstoke","name_cn":"雷夫斯托克"},"58":{"name_en":"Richmond","name_cn":"里士满"},"59":{"name_en":"Rossland","name_cn":"罗斯兰"},"60":{"name_en":"Salmon Arm","name_cn":"三文鱼手臂"},"61":{"name_en":"Surrey","name_cn":"萨里"},"62":{"name_en":"Terrace","name_cn":"露台"},"63":{"name_en":"Trail","name_cn":"足迹"},"64":{"name_en":"Vancouver","name_cn":"温哥华"},"65":{"name_en":"Vernon","name_cn":"弗农"},"66":{"name_en":"Victoria","name_cn":"维多利亚"},"67":{"name_en":"West Kelowna","name_cn":"西基洛纳"},"68":{"name_en":"White Rock","name_cn":"白石"},"69":{"name_en":"Williams Lake","name_cn":"威廉姆斯湖"},"70":{"name_en":"Brandon","name_cn":"布兰登"},"71":{"name_en":"Dauphin","name_cn":"多芬"},"72":{"name_en":"Flin Flon","name_cn":"弗林弗仑"},"73":{"name_en":"Morden","name_cn":"莫登"},"74":{"name_en":"Portage la Prairie","name_cn":"波蒂奇拉普雷"},"75":{"name_en":"Selkirk","name_cn":"德文"},"76":{"name_en":"Steinbach","name_cn":"施泰因巴赫"},"77":{"name_en":"Thompson","name_cn":"汤普森"},"78":{"name_en":"Winkler","name_cn":"温克勒"},"79":{"name_en":"Winnipeg","name_cn":"温尼伯"},"80":{"name_en":"Bathurst","name_cn":"巴瑟斯特"},"81":{"name_en":"Campbellton","name_cn":"坎贝尔顿"},"82":{"name_en":"Dieppe","name_cn":"迪耶普"},"83":{"name_en":"Edmundston","name_cn":"埃德门兹顿"},"84":{"name_en":"Fredericton","name_cn":"弗雷德里克顿"},"85":{"name_en":"Miramichi","name_cn":"米罗米奇"},"86":{"name_en":"Moncton","name_cn":"蒙克顿"},"87":{"name_en":"Saint John","name_cn":"圣约翰"},"88":{"name_en":"Corner Brook","name_cn":"科纳布鲁克"},"89":{"name_en":"Mount Pearl","name_cn":"珠山"},"90":{"name_en":"St. John's","name_cn":"圣约翰"},"91":{"name_en":"Yellowknife","name_cn":"耶洛奈夫"},"92":{"name_en":"Halifax","name_cn":"哈利法克斯"},"93":{"name_en":"Sydney","name_cn":"悉尼"},"94":{"name_en":"Dartmouth","name_cn":"达特茅斯"},"95":{"name_en":"Iqaluit","name_cn":"伊卡卢伊特"},"96":{"name_en":"Barrie","name_cn":"巴里"},"97":{"name_en":"Belleville","name_cn":"贝尔维尔"},"98":{"name_en":"Brampton","name_cn":"宾顿市"},"99":{"name_en":"Brant","name_cn":"布兰特"},"100":{"name_en":"Brantford","name_cn":"布兰特福德"},"101":{"name_en":"Brockville","name_cn":"布罗克维尔"},"102":{"name_en":"Burlington","name_cn":"伯灵顿"},"103":{"name_en":"Cambridge","name_cn":"剑桥"},"104":{"name_en":"Clarence-Rockland","name_cn":"克拉伦斯 - 罗克兰"},"105":{"name_en":"Cornwall","name_cn":"康沃尔"},"106":{"name_en":"Dryden","name_cn":"德莱顿"},"107":{"name_en":"Elliot Lake","name_cn":"埃利奥特莱克"},"108":{"name_en":"Greater Sudbury","name_cn":"大萨德伯里"},"109":{"name_en":"Guelph","name_cn":"圭尔夫大学"},"110":{"name_en":"Haldimand County","name_cn":"哈尔迪曼德县"},"111":{"name_en":"Hamilton","name_cn":"哈密尔顿"},"112":{"name_en":"Kawartha Lakes","name_cn":"卡沃萨湖"},"113":{"name_en":"Kenora","name_cn":"凯洛拉"},"114":{"name_en":"Kingston","name_cn":"金士顿"},"115":{"name_en":"Kitchener","name_cn":"基奇纳"},"116":{"name_en":"London","name_cn":"伦敦"},"117":{"name_en":"Markham","name_cn":"万锦"},"118":{"name_en":"Mississauga","name_cn":"密西沙加"},"119":{"name_en":"Niagara Falls","name_cn":"尼亚加拉大瀑布"},"120":{"name_en":"Norfolk County","name_cn":"诺福克郡"},"121":{"name_en":"North Bay","name_cn":"北部湾"},"122":{"name_en":"Orillia","name_cn":"奥瑞拉"},"123":{"name_en":"Oshawa","name_cn":"奥沙瓦"},"124":{"name_en":"Ottawa","name_cn":"渥太华"},"125":{"name_en":"Owen Sound","name_cn":"欧文桑德"},"126":{"name_en":"Pembroke","name_cn":"彭布罗克"},"127":{"name_en":"Peterborough","name_cn":"彼得伯勒"},"128":{"name_en":"Pickering","name_cn":"皮克林"},"129":{"name_en":"Port Colborne","name_cn":"科尔本港"},"130":{"name_en":"Prince Edward County","name_cn":"爱德华王子县"},"131":{"name_en":"Quinte West","name_cn":"西昆特"},"132":{"name_en":"Sarnia","name_cn":"萨尼亚"},"133":{"name_en":"Sault Ste. Marie","name_cn":"苏圣玛丽"},"134":{"name_en":"St. Catharines","name_cn":"圣圣凯瑟琳"},"135":{"name_en":"St. Thomas","name_cn":"圣托马斯"},"136":{"name_en":"Stratford","name_cn":"斯特拉特福"},"137":{"name_en":"Temiskaming Shores","name_cn":"蒂米斯卡明湖岸市"},"138":{"name_en":"Thorold","name_cn":"索罗尔德"},"139":{"name_en":"Thunder Bay","name_cn":"雷湾"},"140":{"name_en":"Timmins","name_cn":"蒂明斯"},"141":{"name_en":"Toronto","name_cn":"多伦多"},"142":{"name_en":"Vaughan","name_cn":"沃恩"},"143":{"name_en":"Waterloo","name_cn":"滑铁卢"},"144":{"name_en":"Welland","name_cn":"韦兰"},"145":{"name_en":"Windsor","name_cn":"温莎"},"146":{"name_en":"Woodstock","name_cn":"伍德斯托克"},"147":{"name_en":"Charlottetown","name_cn":"夏洛特敦"},"148":{"name_en":"Summerside","name_cn":"萨默赛德"},"149":{"name_en":"Montréal","name_cn":"蒙特利尔"},"150":{"name_en":"Québec","name_cn":"魁北克"},"151":{"name_en":"Laval","name_cn":"拉瓦勒"},"152":{"name_en":"Gatineau","name_cn":"加蒂诺"},"153":{"name_en":"Longueuil","name_cn":"隆格伊"},"154":{"name_en":"Sherbrooke","name_cn":"舍布鲁克"},"155":{"name_en":"Saguenay","name_cn":"萨格奈"},"156":{"name_en":"Lévis","name_cn":"莱维斯"},"157":{"name_en":"Trois-Rivières","name_cn":"三河"},"158":{"name_en":"Terrebonne","name_cn":"泰勒博恩"},"159":{"name_en":"Estevan","name_cn":"埃斯特万"},"160":{"name_en":"Flin Flon","name_cn":"弗林弗伦"},"161":{"name_en":"Humboldt","name_cn":"洪堡"},"162":{"name_en":"Lloydminster","name_cn":"劳埃德敏斯特"},"163":{"name_en":"Martensville","name_cn":"马丁斯维尔"},"164":{"name_en":"Meadow Lake","name_cn":"梅多湖"},"165":{"name_en":"Melfort","name_cn":"梅尔福德"},"166":{"name_en":"Melville","name_cn":"梅尔维尔"},"167":{"name_en":"Moose Jaw","name_cn":"麋鹿爪"},"168":{"name_en":"North Battleford","name_cn":"北巴特福德"},"169":{"name_en":"Prince Albert","name_cn":"阿尔伯特王子"},"170":{"name_en":"Regina","name_cn":"里贾纳"},"171":{"name_en":"Saskatoon","name_cn":"萨斯卡通"},"172":{"name_en":"Swift Current","name_cn":"斯威夫特"},"173":{"name_en":"Warman","name_cn":"沃曼"},"174":{"name_en":"Weyburn","name_cn":"韦恩"},"175":{"name_en":"Yorkton","name_cn":"约克顿"},"176":{"name_en":"Whitehorse","name_cn":"怀特霍斯"},"177":{"name_en":"Birmingham","name_cn":"伯明翰"},"178":{"name_en":"Montgomery","name_cn":"蒙哥马利"},"179":{"name_en":"Mobile","name_cn":"移动"},"180":{"name_en":"Huntsville","name_cn":"亨茨维尔"},"181":{"name_en":"Tuscaloosa","name_cn":"塔斯卡卢萨"},"182":{"name_en":"Anchorage","name_cn":"安克雷奇"},"183":{"name_en":"Juneau","name_cn":"朱诺"},"184":{"name_en":"Fairbanks","name_cn":"费尔班克斯"},"185":{"name_en":"Sitka","name_cn":"锡特卡"},"186":{"name_en":"Ketchikan","name_cn":"凯奇坎"},"187":{"name_en":"Phoenix","name_cn":"凤凰城"},"188":{"name_en":"Tucson","name_cn":"图森"},"189":{"name_en":"Mesa","name_cn":"梅萨"},"190":{"name_en":"Chandler","name_cn":"钱德勒"},"191":{"name_en":"Glendale","name_cn":"格伦代尔"},"192":{"name_en":"Little Rock","name_cn":"小石城"},"193":{"name_en":"Fort Smith","name_cn":"史密斯堡"},"194":{"name_en":"Fayetteville","name_cn":"费耶特维尔"},"195":{"name_en":"Springdale","name_cn":"斯普林代尔"},"196":{"name_en":"Jonesboro","name_cn":"琼斯博罗"},"197":{"name_en":"Los Angeles","name_cn":"洛杉矶"},"198":{"name_en":"San Diego","name_cn":"圣地亚哥"},"199":{"name_en":"San Jose","name_cn":"圣何塞"},"200":{"name_en":"San Francisco","name_cn":"旧金山"},"201":{"name_en":"Fresno","name_cn":"弗雷斯诺"},"202":{"name_en":"Sacramento","name_cn":"萨克拉曼多"},"203":{"name_en":"Denver","name_cn":"丹佛"},"204":{"name_en":"Colorado Springs","name_cn":"科罗拉多泉"},"205":{"name_en":"Aurora","name_cn":"奥罗拉"},"206":{"name_en":"Fort Collins","name_cn":"柯林斯堡"},"207":{"name_en":"Lakewood","name_cn":"莱克伍德"},"208":{"name_en":"Bridgeport","name_cn":"布里奇波特"},"209":{"name_en":"New Haven","name_cn":"纽黑文"},"210":{"name_en":"Stamford","name_cn":"斯坦福德"},"211":{"name_en":"Hartford","name_cn":"哈特福德"},"212":{"name_en":"Waterbury","name_cn":"沃特伯里"},"213":{"name_en":"Wilmington","name_cn":"威尔明顿"},"214":{"name_en":"Dover","name_cn":"多佛"},"215":{"name_en":"Newark","name_cn":"纽瓦克"},"216":{"name_en":"Middletown","name_cn":"米德尔敦"},"217":{"name_en":"Smyrna","name_cn":"士每拿"},"218":{"name_en":"Jacksonville","name_cn":"杰克逊维尔"},"219":{"name_en":"Miami","name_cn":"迈阿密"},"220":{"name_en":"Tampa","name_cn":"坦帕"},"221":{"name_en":"Orlando","name_cn":"奥兰多"},"222":{"name_en":"St. Petersburg","name_cn":"圣。彼得堡"},"223":{"name_en":"Tallahassee","name_cn":"塔拉哈西"},"224":{"name_en":"Atlanta","name_cn":"亚特兰大"},"225":{"name_en":"Columbus","name_cn":"哥伦布"},"226":{"name_en":"Augusta","name_cn":"奥古斯塔"},"227":{"name_en":"Macon","name_cn":"梅肯"},"228":{"name_en":"Savannah","name_cn":"萨凡纳"},"229":{"name_en":"Honolulu","name_cn":"檀香山"},"230":{"name_en":"Hilo","name_cn":"希洛"},"231":{"name_en":"Kailua","name_cn":"凯鲁瓦"},"232":{"name_en":"Kapolei","name_cn":"卡波里"},"233":{"name_en":"Kaneohe","name_cn":"卡尼奥"},"234":{"name_en":"Boise","name_cn":"博伊西"},"235":{"name_en":"Meridian","name_cn":"子午线"},"236":{"name_en":"Nampa","name_cn":"南帕"},"237":{"name_en":"Idaho Falls","name_cn":"爱达荷福尔斯"},"238":{"name_en":"Pocatello","name_cn":"波卡特洛"},"239":{"name_en":"Chicago","name_cn":"芝加哥"},"240":{"name_en":"Aurora","name_cn":"奥罗拉"},"241":{"name_en":"Rockford","name_cn":"罗克福德"},"242":{"name_en":"Joliet","name_cn":"乔利埃"},"243":{"name_en":"Naperville","name_cn":"内珀维尔"},"244":{"name_en":"Springfield","name_cn":"斯普林菲尔德"},"245":{"name_en":"Indianapolis","name_cn":"印第安纳波利斯"},"246":{"name_en":"Fort Wayne","name_cn":"韦恩堡"},"247":{"name_en":"Evansville","name_cn":"埃文斯维尔"},"248":{"name_en":"South Bend","name_cn":"南本德"},"249":{"name_en":"Carmel","name_cn":"卡梅尔"},"250":{"name_en":"Des Moines","name_cn":"得梅因"},"251":{"name_en":"Cedar Rapids","name_cn":"雪松拉皮兹"},"252":{"name_en":"Davenport","name_cn":"达文波特"},"253":{"name_en":"Sioux City","name_cn":"苏城"},"254":{"name_en":"Waterloo","name_cn":"滑铁卢"},"255":{"name_en":"Wichita","name_cn":"威奇托"},"256":{"name_en":"Overland Park","name_cn":"陆上公园"},"257":{"name_en":"Kansas City","name_cn":"堪萨斯城"},"258":{"name_en":"Olathe","name_cn":"奥拉特"},"259":{"name_en":"Topeka","name_cn":"托皮卡"},"260":{"name_en":"Louisville","name_cn":"路易斯维尔"},"261":{"name_en":"Lexington","name_cn":"列克星敦"},"262":{"name_en":"Bowling Green","name_cn":"保龄球场"},"263":{"name_en":"Owensboro","name_cn":"欧文斯伯勒"},"264":{"name_en":"Covington","name_cn":"科文顿"},"265":{"name_en":"Frankfort","name_cn":"法兰克福"},"266":{"name_en":"New Orleans","name_cn":"新奥尔良"},"267":{"name_en":"Baton Rouge","name_cn":"巴吞鲁日"},"268":{"name_en":"Shreveport","name_cn":"什里夫波特"},"269":{"name_en":"Lafayette","name_cn":"拉斐特"},"270":{"name_en":"Lake Charles","name_cn":"查尔斯湖"},"271":{"name_en":"Portland","name_cn":"波特兰"},"272":{"name_en":"Lewiston","name_cn":"刘易斯顿"},"273":{"name_en":"Bangor","name_cn":"班戈"},"274":{"name_en":"South Portland","name_cn":"南波特兰"},"275":{"name_en":"Auburn","name_cn":"奥本"},"276":{"name_en":"Augusta","name_cn":"奥古斯塔"},"277":{"name_en":"Baltimore","name_cn":"巴尔的摩"},"278":{"name_en":"Columbia","name_cn":"哥伦比亚"},"279":{"name_en":"Germantown","name_cn":"德国镇"},"280":{"name_en":"Silver Spring","name_cn":"银色春天"},"281":{"name_en":"Waldorf","name_cn":"华尔道夫"},"282":{"name_en":"Annapolis","name_cn":"安纳波利斯"},"283":{"name_en":"Boston","name_cn":"波士顿"},"284":{"name_en":"Worcester","name_cn":"伍斯特"},"285":{"name_en":"Springfield","name_cn":"斯普林菲尔德"},"286":{"name_en":"Lowell","name_cn":"洛厄尔"},"287":{"name_en":"Cambridge","name_cn":"剑桥"},"288":{"name_en":"Detroit","name_cn":"底特律"},"289":{"name_en":"Grand Rapids","name_cn":"大瀑布城"},"290":{"name_en":"Warren","name_cn":"沃伦"},"291":{"name_en":"Sterling Heights","name_cn":"斯特林高地"},"292":{"name_en":"Ann Arbor","name_cn":"安娜堡"},"293":{"name_en":"Lansing","name_cn":"兰辛"},"294":{"name_en":"Minneapolis","name_cn":"明尼阿波利斯"},"295":{"name_en":"Saint Paul","name_cn":"圣保罗"},"296":{"name_en":"Rochester","name_cn":"罗切斯特"},"297":{"name_en":"Bloomington","name_cn":"布卢明顿"},"298":{"name_en":"Duluth","name_cn":"德卢斯"},"299":{"name_en":"Jackson","name_cn":"杰克逊"},"300":{"name_en":"Gulfport","name_cn":"格尔波特"},"301":{"name_en":"Southaven","name_cn":"南天"},"302":{"name_en":"Hattiesburg","name_cn":"哈蒂斯堡"},"303":{"name_en":"Biloxi","name_cn":"比洛克西"},"304":{"name_en":"Kansas City","name_cn":"堪萨斯城"},"305":{"name_en":"Saint Louis","name_cn":"圣路易斯"},"306":{"name_en":"Springfield","name_cn":"斯普林菲尔德"},"307":{"name_en":"Independence","name_cn":"独立"},"308":{"name_en":"Columbia","name_cn":"哥伦比亚"},"309":{"name_en":"Jefferson City","name_cn":"杰斐逊城"},"310":{"name_en":"Billings","name_cn":"比林斯"},"311":{"name_en":"Missoula","name_cn":"米苏拉"},"312":{"name_en":"Great Falls","name_cn":"大瀑布"},"313":{"name_en":"Bozeman","name_cn":"博兹曼"},"314":{"name_en":"Butte","name_cn":"布特"},"315":{"name_en":"Helena","name_cn":"海伦娜"},"316":{"name_en":"Omaha","name_cn":"奥马哈"},"317":{"name_en":"Lincoln","name_cn":"林肯"},"318":{"name_en":"Bellevue","name_cn":"贝尔维尤"},"319":{"name_en":"Grand Island","name_cn":"格兰德岛"},"320":{"name_en":"Kearney","name_cn":"科尔尼"},"321":{"name_en":"Las Vegas","name_cn":"拉斯维加斯"},"322":{"name_en":"Henderson","name_cn":"亨德森"},"323":{"name_en":"Reno","name_cn":"里诺"},"324":{"name_en":"North Las Vegas","name_cn":"北拉斯维加斯"},"325":{"name_en":"Sparks","name_cn":"火花"},"326":{"name_en":"Carson City","name_cn":"卡森市"},"327":{"name_en":"Manchester","name_cn":"曼彻斯特"},"328":{"name_en":"Nashua","name_cn":"纳舒阿"},"329":{"name_en":"Concord","name_cn":"康科德"},"330":{"name_en":"Derry","name_cn":"德里"},"331":{"name_en":"Rochester","name_cn":"罗彻斯特"},"332":{"name_en":"Newark","name_cn":"纽瓦克"},"333":{"name_en":"Jersey City","name_cn":"泽西市"},"334":{"name_en":"Paterson","name_cn":"帕特森"},"335":{"name_en":"Elizabeth","name_cn":"伊丽莎白"},"336":{"name_en":"Edison","name_cn":"爱迪生"},"337":{"name_en":"Trenton","name_cn":"特伦顿"},"338":{"name_en":"Albuquerque","name_cn":"阿尔伯克基"},"339":{"name_en":"Las Cruces","name_cn":"拉斯克鲁塞斯"},"340":{"name_en":"Rio Rancho","name_cn":"里约热内卢"},"341":{"name_en":"Santa Fe","name_cn":"圣菲"},"342":{"name_en":"Roswell","name_cn":"罗斯韦尔"},"343":{"name_en":"New York City","name_cn":"纽约市"},"344":{"name_en":"Buffalo","name_cn":"水牛城"},"345":{"name_en":"Rochester","name_cn":"罗彻斯特"},"346":{"name_en":"Yonkers","name_cn":"永格尔斯"},"347":{"name_en":"Syracuse","name_cn":"雪城"},"348":{"name_en":"Albany","name_cn":"奥尔巴尼"},"349":{"name_en":"Charlotte","name_cn":"夏洛特"},"350":{"name_en":"Raleigh","name_cn":"罗利"},"351":{"name_en":"Greensboro","name_cn":"格林斯博罗"},"352":{"name_en":"Durham","name_cn":"达勒姆"},"353":{"name_en":"Winston-Salem","name_cn":"温斯顿塞勒姆"},"354":{"name_en":"Fargo","name_cn":"法戈"},"355":{"name_en":"Bismarck","name_cn":"俾斯麦"},"356":{"name_en":"Grand Forks","name_cn":"大福克斯"},"357":{"name_en":"Minot","name_cn":"米诺特"},"358":{"name_en":"West Fargo","name_cn":"西法戈"},"359":{"name_en":"Columbus","name_cn":"哥伦布"},"360":{"name_en":"Cleveland","name_cn":"克利夫兰"},"361":{"name_en":"Cincinnati","name_cn":"辛辛那提"},"362":{"name_en":"Toledo","name_cn":"托莱多"},"363":{"name_en":"Akron","name_cn":"阿克伦"},"364":{"name_en":"Oklahoma City","name_cn":"俄克拉荷马城"},"365":{"name_en":"Tulsa","name_cn":"塔尔萨"},"366":{"name_en":"Norman","name_cn":"诺曼"},"367":{"name_en":"Broken Arrow","name_cn":"布罗克"},"368":{"name_en":"Lawton","name_cn":"劳顿"},"369":{"name_en":"Portland","name_cn":"波特兰"},"370":{"name_en":"Salem","name_cn":"塞勒姆"},"371":{"name_en":"Eugene","name_cn":"尤金"},"372":{"name_en":"Gresham","name_cn":"格雷沙姆"},"373":{"name_en":"Hillsboro","name_cn":"希尔斯伯勒"},"374":{"name_en":"Philadelphia","name_cn":"费城"},"375":{"name_en":"Pittsburgh","name_cn":"匹兹堡"},"376":{"name_en":"Allentown","name_cn":"阿伦敦"},"377":{"name_en":"Erie","name_cn":"伊利"},"378":{"name_en":"Reading","name_cn":"雷丁"},"379":{"name_en":"Harrisburg","name_cn":"哈里斯堡"},"380":{"name_en":"Providence","name_cn":"普罗维登斯"},"381":{"name_en":"Warwick","name_cn":"沃里克"},"382":{"name_en":"Cranston","name_cn":"克兰斯顿"},"383":{"name_en":"Pawtucket","name_cn":"鲍塔克特"},"384":{"name_en":"East Providence","name_cn":"东普罗维登斯"},"385":{"name_en":"Columbia","name_cn":"哥伦比亚"},"386":{"name_en":"Charleston","name_cn":"查尔斯顿"},"387":{"name_en":"North Charleston","name_cn":"北查尔斯顿"},"388":{"name_en":"Mount Pleasant","name_cn":"芒特普莱森特"},"389":{"name_en":"Rock Hill","name_cn":"岩山"},"390":{"name_en":"Sioux Falls","name_cn":"苏族瀑布"},"391":{"name_en":"Rapid City","name_cn":"拉皮德城"},"392":{"name_en":"Aberdeen","name_cn":"阿伯丁"},"393":{"name_en":"Brookings","name_cn":"布鲁金斯"},"394":{"name_en":"Watertown","name_cn":"沃特敦"},"395":{"name_en":"Pierre","name_cn":"皮埃尔"},"396":{"name_en":"Memphis","name_cn":"孟菲斯"},"397":{"name_en":"Nashville","name_cn":"纳什维尔"},"398":{"name_en":"Knoxville","name_cn":"诺克斯维尔"},"399":{"name_en":"Chattanooga","name_cn":"查塔努加"},"400":{"name_en":"Clarksville","name_cn":"克拉克斯维尔"},"401":{"name_en":"Houston","name_cn":"休斯敦"},"402":{"name_en":"San Antonio","name_cn":"圣安东尼奥"},"403":{"name_en":"Dallas","name_cn":"达拉斯"},"404":{"name_en":"Austin","name_cn":"奥斯汀"},"405":{"name_en":"Fort Worth","name_cn":"沃思堡"},"406":{"name_en":"Salt Lake City","name_cn":"盐湖城"},"407":{"name_en":"West Valley City","name_cn":"西谷城"},"408":{"name_en":"Provo","name_cn":"普罗沃"},"409":{"name_en":"West Jordan","name_cn":"西约旦"},"410":{"name_en":"Orem","name_cn":"奥雷姆"},"411":{"name_en":"Burlington","name_cn":"伯灵顿"},"412":{"name_en":"Essex","name_cn":"埃塞克斯"},"413":{"name_en":"South Burlington","name_cn":"南伯灵顿"},"414":{"name_en":"Colchester","name_cn":"科尔切斯特"},"415":{"name_en":"Rutland","name_cn":"拉特兰"},"416":{"name_en":"Montpelier","name_cn":"蒙彼利埃"},"417":{"name_en":"Virginia Beach","name_cn":"弗吉尼亚海滩"},"418":{"name_en":"Norfolk","name_cn":"诺福克"},"419":{"name_en":"Chesapeake","name_cn":"切萨皮克"},"420":{"name_en":"Arlington","name_cn":"阿灵顿"},"421":{"name_en":"Richmond","name_cn":"里士满"},"422":{"name_en":"Seattle","name_cn":"西雅图"},"423":{"name_en":"Spokane","name_cn":"斯波坎"},"424":{"name_en":"Tacoma","name_cn":"塔科马"},"425":{"name_en":"Vancouver","name_cn":"温哥华"},"426":{"name_en":"Bellevue","name_cn":"贝尔维尤"},"427":{"name_en":"Olympia","name_cn":"奥林匹亚"},"428":{"name_en":"Charleston","name_cn":"查尔斯顿"},"429":{"name_en":"Huntington","name_cn":"亨廷顿"},"430":{"name_en":"Morgantown","name_cn":"摩根城"},"431":{"name_en":"Parkersburg","name_cn":"派克斯堡"},"432":{"name_en":"Wheeling","name_cn":"威林"},"433":{"name_en":"Milwaukee","name_cn":"密尔沃基"},"434":{"name_en":"Madison","name_cn":"麦迪逊"},"435":{"name_en":"Green Bay","name_cn":"绿湾"},"436":{"name_en":"Kenosha","name_cn":"肯索沙"},"437":{"name_en":"Racine","name_cn":"拉辛"},"438":{"name_en":"Cheyenne","name_cn":"夏延"},"439":{"name_en":"Casper","name_cn":"卡斯珀"},"440":{"name_en":"Laramie","name_cn":"拉里米"},"441":{"name_en":"Gillette","name_cn":"吉列"},"442":{"name_en":"Rock Springs","name_cn":"罗克斯普林斯"}},
	all_categories: {"41":{"name_en":"Automotive & Tires","name_cn":"汽车及轮胎"},"42":{"name_en":"Computers","name_cn":"电脑"},"43":{"name_en":"Electronics","name_cn":"电子"},"44":{"name_en":"Furniture","name_cn":"家具"},"45":{"name_en":"Appliance","name_cn":"家电"},"46":{"name_en":"Office Products","name_cn":"办公用品"},"47":{"name_en":"Sports & Fitness","name_cn":"体育健身"},"48":{"name_en":"Kids & Toys","name_cn":"儿童玩具"},"49":{"name_en":"Health & Beauty","name_cn":"保健美容"},"50":{"name_en":"Jewellery & Fashion","name_cn":"珠宝和时装"}},
	all_items: {"525":{"name_en":"Tires","name_cn":"轮胎"},"526":{"name_en":"Wheels","name_cn":"轮毂"},"527":{"name_en":"Winter Products","name_cn":"冬季产品"},"528":{"name_en":"Car Shelters","name_cn":"汽车候车亭"},"529":{"name_en":"RV Accessories","name_cn":"RV配件"},"530":{"name_en":"Car & Truck Accessories","name_cn":"汽车和卡车配件"},"531":{"name_en":"Automotive Electronics","name_cn":"汽车电子"},"532":{"name_en":"Motor Oil & Lubricants","name_cn":"汽车油和润滑油"},"533":{"name_en":"ATV & UTV Accessories","name_cn":"ATV＆UTV配件"},"534":{"name_en":"Shop & Garage Equipment","name_cn":"车间和车库设备"},"535":{"name_en":"Trailers","name_cn":"拖车"},"536":{"name_en":"Batteries","name_cn":"电池"},"537":{"name_en":"Other","name_cn":"其他"},"538":{"name_en":"Laptops","name_cn":"笔记本电脑"},"539":{"name_en":"iPads & Tablets","name_cn":"ipad公司和平板电脑"},"540":{"name_en":"Desktops","name_cn":"台式机"},"541":{"name_en":"Printers & Scanners","name_cn":"打印机和扫描仪"},"542":{"name_en":"Monitors & Accessories","name_cn":"显示器及配件"},"543":{"name_en":"Hard Drives & Storage Devices","name_cn":"硬盘驱动器和数据存储设备"},"544":{"name_en":"Computer Accessories","name_cn":"电脑配件"},"545":{"name_en":"Routers & Networking","name_cn":"路由器和网络设备"},"546":{"name_en":"Software","name_cn":"软件"},"547":{"name_en":"Other","name_cn":"其他"},"548":{"name_en":"Apple Products","name_cn":"苹果产品"},"549":{"name_en":"Televisions","name_cn":"电视机"},"550":{"name_en":"Musical Instruments","name_cn":"乐器"},"551":{"name_en":"Digital Cameras & Camcorders","name_cn":"数码相机和摄像机"},"552":{"name_en":"Surveillance & Security Systems","name_cn":"监控及安全系统"},"553":{"name_en":"Audio/Video","name_cn":"音频/视频"},"554":{"name_en":"GPS","name_cn":"GPS"},"555":{"name_en":"Cellular Phones and Accessories","name_cn":"手机及配件"},"556":{"name_en":"Phones","name_cn":"手机"},"557":{"name_en":"Mounts & Cables","name_cn":"固定件及电缆"},"558":{"name_en":"Video Games & Consoles","name_cn":"视频游戏和游戏机"},"559":{"name_en":"Projectors & Screens","name_cn":"投影仪和屏幕"},"560":{"name_en":"Bedroom Furniture","name_cn":"卧室家具"},"561":{"name_en":"Mattresses","name_cn":"床垫"},"562":{"name_en":"Dining & Kitchen Furniture","name_cn":"餐厅和厨房家具"},"563":{"name_en":"Living Room Furniture","name_cn":"客厅家具"},"564":{"name_en":"Entertainment Furniture","name_cn":"娱乐家具"},"565":{"name_en":"Accent Furniture","name_cn":"家具口音"},"566":{"name_en":"Baby & Kids' Furniture","name_cn":"婴幼儿及儿童家具"},"567":{"name_en":"Modern Furniture","name_cn":"现代家具"},"568":{"name_en":"Condo Furniture","name_cn":"公寓家具"},"569":{"name_en":"Refrigerators","name_cn":"冰箱"},"570":{"name_en":"Cooking Appliances","name_cn":"灶具"},"571":{"name_en":"Dishwashers","name_cn":"洗碗机"},"572":{"name_en":"Laundry","name_cn":"洗衣房"},"573":{"name_en":"Kitchen Suites","name_cn":"厨房设施"},"574":{"name_en":"Commercial Appliances","name_cn":"商用电器"},"575":{"name_en":"Freezers & Ice Makers","name_cn":"冰柜和制冰机"},"576":{"name_en":"Microwaves","name_cn":"微波炉"},"577":{"name_en":"Wine Cellars","name_cn":"酒窖"},"578":{"name_en":"Off-Grid Appliances","name_cn":"离网家电"},"579":{"name_en":"Cooling","name_cn":"制冷"},"580":{"name_en":"Heating & Air Treatment","name_cn":"制热和空气处理"},"581":{"name_en":"Other","name_cn":"其他"},"582":{"name_en":"Office Furniture","name_cn":"办公家具"},"583":{"name_en":"Office Supplies","name_cn":"办公用品"},"584":{"name_en":"Office Paper & Stationery","name_cn":"办公用纸及文具"},"585":{"name_en":"Ink & Toner Cartridges","name_cn":"墨水和硒鼓"},"586":{"name_en":"Business Equipment","name_cn":"商业设备"},"587":{"name_en":"Paper Shredders","name_cn":"碎纸机"},"588":{"name_en":"Cash/Check Handling","name_cn":"现金/支票处理"},"589":{"name_en":"Safes","name_cn":"保险柜"},"590":{"name_en":"School Supplies","name_cn":"学生用品"},"591":{"name_en":"Vending Machines","name_cn":"自动售货机"},"592":{"name_en":"Water Coolers & Accessories","name_cn":"饮水机及配件"},"593":{"name_en":"Catering","name_cn":"餐饮"},"594":{"name_en":"Janitorial & Safety","name_cn":"清洁和安全"},"596":{"name_en":"Briefcases & Laptop Cases","name_cn":"公文包和笔记本电脑包"},"597":{"name_en":"Ergonomics","name_cn":"人体工程学"},"598":{"name_en":"Office Chairs","name_cn":"办公椅"},"599":{"name_en":"Services","name_cn":"服务"},"600":{"name_en":"Movies & Music","name_cn":"电影和音乐"},"602":{"name_en":"Other","name_cn":"其他"},"603":{"name_en":"Boating & Watersports","name_cn":"划船和水上运动"},"604":{"name_en":"Exercise & Fitness","name_cn":"运动与健身"},"605":{"name_en":"Bikes & Skateboards","name_cn":"自行车和滑板"},"606":{"name_en":"Camping","name_cn":"野营"},"607":{"name_en":"Recreational Sports","name_cn":"休闲运动"},"608":{"name_en":"Golf","name_cn":"高尔夫"},"609":{"name_en":"Saunas","name_cn":"桑拿"},"610":{"name_en":"Game Room","name_cn":"游戏室"},"611":{"name_en":"Hockey","name_cn":"曲棍球"},"612":{"name_en":"Hunting & Fishing","name_cn":"狩猎垂钓"},"613":{"name_en":"Binoculars & Telescopes","name_cn":"双筒望远镜和望远镜"},"614":{"name_en":"Sports Memorabilia","name_cn":"体育纪念品"},"615":{"name_en":"Winter Sports","name_cn":"冬季运动"},"616":{"name_en":"Nursery Furniture & Decor","name_cn":"幼儿园家具及装饰"},"617":{"name_en":"Baby Gear","name_cn":"婴儿用品"},"618":{"name_en":"Health & Safety","name_cn":"健康与安全"},"619":{"name_en":"Baby Care","name_cn":"婴儿护理"},"620":{"name_en":"Toys","name_cn":"玩具"},"621":{"name_en":"Baby Toys & Activities","name_cn":"婴儿玩具及活动"},"622":{"name_en":"Baby Gifts & Baskets","name_cn":"婴儿礼品篮"},"623":{"name_en":"Activity Centres","name_cn":"活动中心"},"624":{"name_en":"Kids' Bedroom Collections","name_cn":"儿童卧室集合"},"625":{"name_en":"Bunk Beds","name_cn":"双层床"},"626":{"name_en":"Car Seat","name_cn":"汽车座椅"},"627":{"name_en":"Baby Monitors","name_cn":"婴儿监视器"},"628":{"name_en":"Chairs & Tables","name_cn":"桌椅"},"629":{"name_en":"Arts & Crafts","name_cn":"工艺品"},"630":{"name_en":"Pharmacy","name_cn":"医药"},"631":{"name_en":"First Aid","name_cn":"急救"},"632":{"name_en":"Herbals & Dietary Supplements","name_cn":"草药及膳食补充剂"},"633":{"name_en":"Hearing Devices","name_cn":"听力设备"},"634":{"name_en":"Health & Medicines","name_cn":"保健医药"},"635":{"name_en":"Home Health Care","name_cn":"家庭保健"},"636":{"name_en":"Massage & Relaxation","name_cn":"按摩和放松"},"637":{"name_en":"Nutrition & Weight Management","name_cn":"营养与体重管理"},"638":{"name_en":"Personal Care","name_cn":"个人护理"},"639":{"name_en":"Vitamins & Minerals","name_cn":"维生素和矿物"},"640":{"name_en":"Other","name_cn":"其他"},"641":{"name_en":"Rings","name_cn":"戒指"},"642":{"name_en":"Earrings","name_cn":"耳环"},"643":{"name_en":"Necklaces","name_cn":"项链"},"644":{"name_en":"Solitaire Rings","name_cn":"纸牌戒指"},"645":{"name_en":"Bracelets","name_cn":"手镯"},"646":{"name_en":"Watches","name_cn":"手表"},"647":{"name_en":"Jewellery Sets","name_cn":"首饰套装"},"648":{"name_en":"Handbags & Wallets","name_cn":"手袋及钱包"},"649":{"name_en":"Jewellery Boxes","name_cn":"首饰盒"},"650":{"name_en":"Jewellery Armoires","name_cn":"首饰衣橱"},"651":{"name_en":"Clothing","name_cn":"服装"},"652":{"name_en":"Footwear","name_cn":"鞋类"},"653":{"name_en":"Sunglasses","name_cn":"太阳镜"},"654":{"name_en":"Eyeglass Organizers","name_cn":"眼镜组织者"},"655":{"name_en":"Other","name_cn":"其他"}},
	site_config: {"site":"advertise","admin_email":"laoyezhao@yahoo.ca","auto_email":"\"esaleshome\" <noreply@esaleshome.com>","encript":"guiyangsifangdijuweigaisi","doc_root":"/home/laoye/sites/advertise/webroot","web_root":"/ads","ad_root":"/","category_root":"/sites/category","item_root":"/sites/item","toolkit_src":"/home/laoye/sites/advertise/file/toolkit/src","toolkit_lib":"/home/laoye/sites/advertise/file/toolkit/lib","ad_cost":0,"small_image":"/home/laoye/sites/advertise/webroot/src/image/ad/small","big_image":"/home/laoye/sites/advertise/webroot/src/image/ad/big","main_template":"ad_root_template","perl_root":"/adb","upload_dir":"/home/laoye/sites/advertise/file/upload","small_image_width":"100","small_image_height":"100","big_image_width":"300","big_image_height":"300","maximum_image_number":10,"home_page":"/advertise","page_size":32,"domain":"esaleshome.com","tmp_dir":"/home/laoye/sites/advertise/file/toolkit/src","perl_dir":"/home/laoye/sites/advertise/perlroot","mod_dir":"/home/laoye/sites/lib/Class","large_image":"/home/laoye/sites/advertise/webroot/src/image/ad/large","large_image_width":"650","large_image_height":"650","info_email":"info@esaleshome.com","maximum_image_byte":7},
	site_authenticate: {"account_tabs":{"site":"advertise","page":"account_tabs","access_level":0,"check_ad":0,"check_user":1},"admin-function":{"site":"advertise","page":"admin-function","access_level":2,"check_ad":0,"check_user":1},"admin.pl":{"site":"advertise","page":"admin.pl","access_level":1,"check_ad":1,"check_user":1},"admin_advertise":{"site":"advertise","page":"admin_advertise","access_level":2,"check_ad":0,"check_user":1},"admin_function.pl":{"site":"advertise","page":"admin_function.pl","access_level":0,"check_ad":1,"check_user":1},"admin_user":{"site":"advertise","page":"admin_user","access_level":2,"check_ad":0,"check_user":1},"change-user-profile":{"site":"advertise","page":"change-user-profile","access_level":1,"check_ad":0,"check_user":1},"change_user_profile.pl":{"site":"advertise","page":"change_user_profile.pl","access_level":1,"check_ad":0,"check_user":1},"delete-user-advertise":{"site":"advertise","page":"delete-user-advertise","access_level":1,"check_ad":1,"check_user":1},"delete_advertise.pl":{"site":"advertise","page":"delete_advertise.pl","access_level":1,"check_ad":1,"check_user":1},"edit-ad":{"site":"advertise","page":"edit-ad","access_level":1,"check_ad":1,"check_user":1},"edit_ad":{"site":"advertise","page":"edit_ad","access_level":1,"check_ad":1,"check_user":1},"edit_ad.pl":{"site":"advertise","page":"edit_ad.pl","access_level":1,"check_ad":1,"check_user":1},"edit_advertise":{"site":"advertise","page":"edit_advertise","access_level":1,"check_ad":1,"check_user":1},"edit_advertise.pl":{"site":"advertise","page":"edit_advertise.pl","access_level":1,"check_ad":1,"check_user":1},"fetch-user-ad":{"site":"advertise","page":"fetch-user-ad","access_level":1,"check_ad":1,"check_user":1},"fetch-user-ads":{"site":"advertise","page":"fetch-user-ads","access_level":1,"check_ad":0,"check_user":1},"fetch-user-profile":{"site":"advertise","page":"fetch-user-profile","access_level":1,"check_ad":0,"check_user":1},"generate-htmls":{"site":"advertise","page":"generate-htmls","access_level":2,"check_ad":0,"check_user":1},"generate-static-content":{"site":"advertise","page":"generate-static-content","access_level":2,"check_ad":0,"check_user":1},"generate_htmls.pl":{"site":"advertise","page":"generate_htmls.pl","access_level":2,"check_ad":0,"check_user":1},"generate_static_content.pl":{"site":"advertise","page":"generate_static_content.pl","access_level":2,"check_ad":0,"check_user":1},"page_permission":{"site":"advertise","page":"page_permission","access_level":2,"check_ad":0,"check_user":1},"save_category":{"site":"advertise","page":"save_category","access_level":2,"check_ad":0,"check_user":1},"save_category.pl":{"site":"advertise","page":"save_category.pl","access_level":2,"check_ad":0,"check_user":1},"save_subcategory":{"site":"advertise","page":"save_subcategory","access_level":2,"check_ad":0,"check_user":1},"save_subcategory.pl":{"site":"advertise","page":"save_subcategory.pl","access_level":2,"check_ad":0,"check_user":1},"user.pl":{"site":"advertise","page":"user.pl","access_level":1,"check_ad":0,"check_user":1},"user_account":{"site":"advertise","page":"user_account","access_level":1,"check_ad":0,"check_user":1},"user_advertise":{"site":"advertise","page":"user_advertise","access_level":1,"check_ad":0,"check_user":1},"visitor_hits":{"site":"advertise","page":"visitor_hits","access_level":2,"check_ad":0,"check_user":1},"visitor_hits_list":{"site":"advertise","page":"visitor_hits_list","access_level":2,"check_ad":0,"check_user":1}}
};
exports.get = key => content[key] || null;