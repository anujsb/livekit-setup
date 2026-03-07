// FILE: src/lib/db/seed.ts
// Run: npm run db:seed
import { db } from './index'
import { workspaces, agents, knowledgeEntries } from './schema'

async function seed() {
  console.log('🌱 Seeding database...')

  // Create workspace
  const [ws] = await db.insert(workspaces).values({
    name: 'Acme Corp',
    slug: 'acme-corp',
    plan: 'growth',
    phone: '+15550001234',
    callLimit: 2000,
  }).returning()

  console.log(`✅ Workspace: ${ws.id}`)

  // Create agents
  const [emma] = await db.insert(agents).values({
    workspaceId: ws.id,
    name: 'Emma – Front Desk',
    businessName: 'Acme Corp',
    greeting: "Hi! You've reached Acme Corp. I'm Emma, your AI receptionist. How can I help you today?",
    systemPrompt: `You are Emma, the friendly and professional AI receptionist for Acme Corp.

Your primary goals:
1. Greet callers warmly and make them feel welcome
2. Understand their reason for calling
3. Answer FAQs from the knowledge base accurately
4. Schedule appointments or take messages when needed
5. Escalate to a human only when you truly cannot help

Personality: warm, concise, professional. Never robotic. Use natural conversational language.
Always confirm understanding before acting. Never make up information not in the knowledge base.
Keep responses to 1-3 sentences maximum — this is a voice call.`,
    escalationEmail: 'support@acme.com',
    escalationPhone: '+15550001234',
    status: 'active',
    voiceConfig: { provider: 'groq-playai', voiceId: 'Celeste-PlayAI', speed: 1.0, pitch: 1.0, stability: 0.75 },
  }).returning()

  const [max] = await db.insert(agents).values({
    workspaceId: ws.id,
    name: 'Max – Sales',
    businessName: 'Acme Corp',
    greeting: "Hello! Thanks for calling Acme Corp sales. I'm Max. Are you looking to explore our products or do you have a specific question?",
    systemPrompt: `You are Max, the AI sales assistant for Acme Corp. You are enthusiastic, knowledgeable, and never pushy.

Goals:
1. Understand the prospect's needs
2. Match them to the right product or service
3. Highlight key benefits relevant to their situation
4. Qualify leads and schedule demos for the sales team
5. Handle objections gracefully

Always listen first, then respond. Be curious. Ask one question at a time.
Keep responses to 1-3 sentences — this is a voice call.`,
    escalationEmail: 'sales@acme.com',
    status: 'active',
    voiceConfig: { provider: 'groq-playai', voiceId: 'Atlas-PlayAI', speed: 1.05, pitch: 1.0, stability: 0.8 },
  }).returning()

  console.log(`✅ Agents: ${emma.id}, ${max.id}`)

  // Knowledge base for Emma
  await db.insert(knowledgeEntries).values([
    { agentId: emma.id, category: 'General',    question: 'What are your business hours?',       answer: 'We are open Monday through Friday, 9 AM to 5 PM Eastern Time.' },
    { agentId: emma.id, category: 'General',    question: 'Where are you located?',              answer: 'Our main office is at 123 Business Ave, Suite 400, New York, NY 10001.' },
    { agentId: emma.id, category: 'Scheduling', question: 'How do I schedule an appointment?',   answer: 'I can take your name and preferred time and have someone confirm via email within 2 hours.' },
    { agentId: emma.id, category: 'Support',    question: 'What is your return policy?',         answer: 'We offer a 30-day hassle-free return on all products. Please have your order number ready.' },
    { agentId: emma.id, category: 'Sales',      question: 'Do you offer free consultations?',    answer: 'Yes! Free 30-minute discovery calls are available. I can help schedule one right now.' },
  ])

  // Knowledge for Max
  await db.insert(knowledgeEntries).values([
    { agentId: max.id, category: 'Products', question: 'What products do you offer?',    answer: 'We offer Starter ($49/mo), Growth ($149/mo), and Enterprise (custom pricing) plans.' },
    { agentId: max.id, category: 'Sales',    question: 'Do you offer a free trial?',     answer: 'Absolutely! 14-day free trial, no credit card required. I can help you get started right now.' },
  ])

  console.log(`✅ Knowledge base seeded`)
  console.log(`\n🎉 Done! Workspace ID: ${ws.id}`)
  console.log(`\nAdd this to your .env.local:`)
  console.log(`WORKSPACE_ID=${ws.id}`)
  process.exit(0)
}

seed().catch(e => { console.error(e); process.exit(1) })