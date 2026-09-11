import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { postId } = await request.json();
    if (!postId) return json({ error: 'postId is required' }, 400);
    const authorization = request.headers.get('Authorization');
    if (!authorization) return json({ error: 'Authentication required' }, 401);
    const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authorization } } });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) return json({ error: 'Authentication required' }, 401);
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (!profile || !['admin', 'editor'].includes(profile.role)) return json({ error: 'Admin or editor access required' }, 403);
    const { data: post, error: postError } = await admin.from('posts').select('id,title,excerpt,slug,author,category,featured_image,image_url,published_at,status').eq('id', postId).eq('status', 'published').single();
    if (postError || !post) return json({ error: 'Published post not found' }, 404);
    const { data: delivery, error: deliveryError } = await admin.from('post_notification_deliveries').insert({ post_id: post.id }).select().single();
    if (deliveryError?.code === '23505') return json({ sent: false, duplicate: true });
    if (deliveryError || !delivery) throw deliveryError || new Error('Could not reserve notification delivery');
    const { data: subscribers, error: subscriberError } = await admin.from('email_subscribers').select('email').eq('subscribed_to_new_posts', true);
    if (subscriberError) throw subscriberError;
    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!resendKey) throw new Error('RESEND_API_KEY is not configured');
    const siteUrl = Deno.env.get('PUBLIC_SITE_URL') || 'http://localhost:5173';
    const articleUrl = `${siteUrl}/article/${encodeURIComponent(post.slug)}`;
    const imageUrl = post.featured_image || post.image_url || '';
    for (const subscriber of subscribers || []) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: Deno.env.get('MAIL_FROM') || 'StoryGrid <stories@example.com>', to: [subscriber.email], subject: `STORYGRID: ${post.title}`, html: `<div style="font-family:Arial,sans-serif;background:#050507;color:#f0f0f5;padding:32px"><p style="color:#22d3ee;font-weight:800;letter-spacing:4px">STORYGRID</p><p style="color:#22d3ee;font-weight:700">NEW STORY</p>${imageUrl ? `<img src="${imageUrl}" alt="" style="max-width:100%;height:auto">` : ''}<h1>${post.title}</h1><p style="color:#b8b8c4">${post.excerpt || ''}</p><p>${post.category || 'Story'} · ${post.author || 'Editorial Desk'} · ${new Date(post.published_at).toLocaleDateString()}</p><a href="${articleUrl}" style="display:inline-block;background:#22d3ee;color:#000;padding:12px 18px;border-radius:8px;font-weight:800">READ ARTICLE</a><p style="margin-top:32px;font-size:12px;color:#777">Manage your preferences at ${siteUrl}/account</p></div>` })
      });
    }
    return json({ sent: true, recipients: subscribers?.length || 0 });
  } catch (error) { return json({ error: error instanceof Error ? error.message : 'Notification failed' }, 500); }
});
