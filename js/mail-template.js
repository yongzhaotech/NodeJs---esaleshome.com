'use strict';

const mails = {
	email_to_friend_html_en: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
    <title>[% name %]</title>
</head>
<body>
<div>Hello</div>
<div style="height:25px;"></div>
<div>Your friend [ [% sender %] ] recommends you the following item posted on our site</div>
<div style="height:25px;"></div>
<div>Item name: <a href="http://[% domain %]/ads/ad-detail/[% id %]" style="font-weight:bold;color:#0509a1;">[% name %]</a></div>
<div>Posted: [% time %]</div>
<div>Price: [% price %]</div>
<div style="height:25px;"></div>
<div>Thanks</div>
<div>[% domain %]</div>
<div>[% today %]</div>
</body>
</html>
`, 
	email_to_friend_html_cn: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="zh" xml:lang="zh">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
    <title>[% name %]</title>
</head>
<body>
<div>你好</div>
<div style="height:25px;"></div>
<div>你的朋友 【 [% sender %] 】 向你推荐刊登在本网站的一则广告</div>
<div style="height:25px;"></div>
<div>物品名称: <a href="http://[% domain %]/ads/ad-detail/[% id %]" style="font-weight:bold;color:#0509a1;">[% name %]</a></div>
<div>登载时间: [% time %]</div>
<div>物品价钱: [% price %]</div>
<div style="height:25px;"></div>
<div>谢谢</div>
<div>[% domain %]</div>
<div>[% today %]</div>
</body>
</html>
`,
	ask_poster_html_en: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
    <title>[% name %]</title>
</head>
<body>
<div>Hello [% title %],</div>
<div style="height:25px;"></div>
<div>A buyer shows interests in the following item you posted on this site</div>
<div style="height:25px;"></div>
<div>Item name: <a href="http://[% domain %]/ads/ad-detail/[% id %]" style="font-weight:bold;color:#0509a1;">[% name %]</a></div>
<div>Posted: [% time %]</div>
<div>Price: [% price %]</div>
<div style="height:25px;"></div>
<div>The buyer says:</div>
<div>-------------------------</div>
<div>[% message %]</div>
<div>-------------------------</div>
<div style="height:25px;"></div>
<div>Use "Reply" to communicate with this person</div>
<div style="height:25px;"></div>
<div>Thanks</div>
<div>[% domain %]</div>
<div>[% today %]</div>
</body>
</html>
`,
	ask_poster_html_cn: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="zh" xml:lang="zh">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
    <title>[% name %]</title>
</head>
<body>
<div>你好 [% title %],</div>
<div style="height:25px;"></div>
<div>有一买方对你在本网站登载的下面这则广告感兴趣</div>
<div style="height:25px;"></div>
<div>物品名称: <a href="http://[% domain %]/ads/ad-detail/[% id %]" style="font-weight:bold;color:#0509a1;">[% name %]</a></div>
<div>登载日期: [% time %]</div>
<div>物品价钱: [% price %]</div>
<div style="height:25px;"></div>
<div>买方说:</div>
<div>-------------------------</div>
<div>[% message %]</div>
<div>-------------------------</div>
<div style="height:25px;"></div>
<div>请使用 [ 回复 ] 与此人联系</div>
<div style="height:25px;"></div>
<div>谢谢</div>
<div>[% domain %]</div>
<div>[% today %]</div>
</body>
</html>
`,
	reset_password_email_en: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
    <title>[% name %]</title>
</head>
<body>
	<div>Hello [% first_name %],</div>
	<div style="height:25px;"></div>
	<div>This email is generated based on your request.</div>
	<div>Please follow the link below to reset your password.</div>
	<div>[ <a href="http://[% domain %]/ads/set-pwd/[% acc_code %]en" style="font-weight:bold;">reset password</a> ]</div>
	<div style="height:25px;"></div>
	<div>Thanks</div>
	<div>[% domain %]</div>
</body>
</html>
`,
	reset_password_email_cn: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="zh" xml:lang="zh">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
    <title>[% name %]</title>
</head>
<body>
	<div>你好 [% first_name %],</div>
	<div style="height:25px;"></div>
	<div>这是据你的要求由系统自动生成的电子邮件。</div>
	<div>请点击下面的连接重新设置你的密码。</div>
	<div>【 <a href="http://[% domain %]/ads/set-pwd/[% acc_code %]cn" style="font-weight:bold;">重新设置密码</a> 】</div>
	<div style="height:25px;"></div>
	<div>谢谢</div>
	<div>[% domain %]</div>
</body>
</html>
`
};

exports.get = key => mails[key] || 'No contents';