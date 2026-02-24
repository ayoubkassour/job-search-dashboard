import Anthropic from "@anthropic-ai/sdk";
import type { SupabaseClient } from "@supabase/supabase-js";

const SEARCH_QUERIES = [
  "Senior Product Manager Singapore fintech",
  "Lead Product Manager Singapore",
  "Head of Product Singapore",
  "VP Product Singapore payments",
  "Product Manager Singapore marketplace",
];

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

interface ExtractedJob {
  company: string;
  job_title: string;
  job_url: string;
  key_requirements: string;
}

interface ContactInfo {
  recruiter_name: string;
  recruiter_linkedin: string;
  hiring_manager_name: string;
  hiring_manager_linkedin: string;
}

async function searchWeb(query: string): Promise<SearchResult[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    console.warn("[Tracker] SERPER_API_KEY not set, skipping web search");
    return [];
  }

  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: query,
        location: "Singapore",
        num: 10,
      }),
    });

    const data = await response.json();
    return (data.organic || []).map((r: any) => ({
      title: r.title,
      link: r.link,
      snippet: r.snippet || "",
    }));
  } catch (err) {
    console.error("[Tracker] Search failed for query:", query, err);
    return [];
  }
}

async function analyzeWithClaude(
  results: SearchResult[]
): Promise<ExtractedJob[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn("[Tracker] ANTHROPIC_API_KEY not set, skipping analysis");
    return [];
  }

  const client = new Anthropic({ apiKey });

  const prompt = `You are a job search assistant. Analyze these search results and extract actual job postings for Product Manager roles in Singapore.

For each real job posting found, extract:
- company: The hiring company name
- job_title: The exact job title
- job_url: The application URL
- key_requirements: Key requirements (comma-separated)

Filter for relevance to this candidate profile:

**Ayoub Kassour — Head of Product / VP Product**
- 12+ years of product management experience across fintech, ecommerce, insurance, and FMCG
- Current: Head of Product (Consultant) at Livesport/Flashscore — GTM strategy for MENA expansion
- Previous: VP of Product at Sinbad (B2B FMCG Marketplace, Indonesia) — scaled GMV from $500K to $11M/month
- Previous: Head of Product at Home Credit (Philippines) — built Philippines' first BNPL Marketplace, scaled to 600K MAU
- Previous: Transformation Head at HMD Global (Nokia) — D2C channel, consumer lending, distribution management for 1,200+ stores
- Previous: Senior PM at Société Générale Insurance (Paris) — banking, insurance, wealth management digital products
- Core domains: Marketplace/ecommerce, BNPL/consumer lending, fintech/payments, insurance, distribution, digital transformation
- Strengths: 0-to-1 product builds, B2B and B2C, API-first architecture, growth (acquisition funnels, CRO), market expansion
- Regions: Global experience — Singapore, Indonesia, Philippines, France, MENA. Fluent in English, French, Arabic
- Target roles: Head of Product, VP Product, Senior/Lead PM at startups or growth-stage companies in Singapore
- Target industries: Fintech, payments, marketplace, ecommerce, distribution, insurtech, BNPL, digital banking, SaaS/B2B

Prioritize roles that match his seniority (Head/VP/Lead/Senior PM), domain expertise, and startup/growth-stage company preference. Exclude junior PM roles or roles requiring deep engineering/data science backgrounds.

Search results:
${JSON.stringify(results, null, 2)}

Respond ONLY with a JSON array of extracted jobs. If no relevant jobs found, respond with [].`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (err) {
    console.error("[Tracker] Claude analysis failed:", err);
    return [];
  }
}

async function findContacts(
  company: string,
  jobTitle: string
): Promise<ContactInfo> {
  const defaults: ContactInfo = {
    recruiter_name: "Not Found",
    recruiter_linkedin: "Not Found",
    hiring_manager_name: "Not Found",
    hiring_manager_linkedin: "Not Found",
  };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const serperKey = process.env.SERPER_API_KEY;
  if (!apiKey || !serperKey) return defaults;

  try {
    // Search for recruiter and hiring manager
    const recruiterResults = await searchWeb(
      `${company} recruiter talent acquisition Singapore LinkedIn`
    );
    const hmResults = await searchWeb(
      `${company} "Head of Product" OR "VP Product" OR "Director Product" Singapore LinkedIn`
    );

    const allResults = [
      ...recruiterResults.map((r) => ({ ...r, type: "recruiter" })),
      ...hmResults.map((r) => ({ ...r, type: "hiring_manager" })),
    ];

    if (allResults.length === 0) return defaults;

    const client = new Anthropic({ apiKey });

    const prompt = `From these search results, find the most likely recruiter and hiring manager for a "${jobTitle}" role at ${company} in Singapore.

Search results:
${JSON.stringify(allResults, null, 2)}

Return a JSON object with:
- recruiter_name: Full name of the recruiter/talent acquisition person (or "Not Found")
- recruiter_linkedin: Their LinkedIn URL (or "Not Found")
- hiring_manager_name: Full name of the likely hiring manager — a product leader at the company (or "Not Found")
- hiring_manager_linkedin: Their LinkedIn URL (or "Not Found")

Only include LinkedIn URLs that appear in the search results. Do not fabricate URLs.
Respond ONLY with the JSON object.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return { ...defaults, ...parsed };
    }
    return defaults;
  } catch (err) {
    console.error(`[Tracker] Contact search failed for ${company}:`, err);
    return defaults;
  }
}

export async function runJobTracker(supabase: SupabaseClient) {
  console.log("[Tracker] Starting job search run...");
  let totalFound = 0;
  let newAdded = 0;
  const logs: string[] = [];

  try {
    // Step 1: Gather all search results
    const allResults: SearchResult[] = [];
    for (const query of SEARCH_QUERIES) {
      const results = await searchWeb(query);
      allResults.push(...results);
      logs.push(`Query "${query}": ${results.length} results`);
    }

    totalFound = allResults.length;
    logs.push(`Total search results: ${totalFound}`);

    if (allResults.length === 0) {
      logs.push("No search results found. Check API key configuration.");
    } else {
      // Step 2: Analyze with Claude
      const extractedJobs = await analyzeWithClaude(allResults);
      logs.push(`Extracted ${extractedJobs.length} relevant jobs`);

      // Step 3: Check for duplicates, find contacts, and insert new jobs
      for (const job of extractedJobs) {
        const { data: existing } = await supabase
          .from("jobs")
          .select("id")
          .or(
            `job_url.eq.${job.job_url},and(company.eq.${job.company},job_title.eq.${job.job_title})`
          )
          .limit(1);

        if (!existing || existing.length === 0) {
          // Find contacts for this job
          logs.push(`Searching contacts for ${job.company}...`);
          const contacts = await findContacts(job.company, job.job_title);
          logs.push(
            `  Recruiter: ${contacts.recruiter_name}, HM: ${contacts.hiring_manager_name}`
          );

          const { error } = await supabase.from("jobs").insert({
            company: job.company,
            job_title: job.job_title,
            job_url: job.job_url,
            key_requirements: job.key_requirements,
            recruiter_name: contacts.recruiter_name,
            recruiter_linkedin: contacts.recruiter_linkedin,
            hiring_manager_name: contacts.hiring_manager_name,
            hiring_manager_linkedin: contacts.hiring_manager_linkedin,
            source: "tracker",
            status: "Saved",
          });

          if (!error) {
            newAdded++;
            logs.push(`Added: ${job.company} - ${job.job_title}`);
          } else {
            logs.push(`Failed to add ${job.company}: ${error.message}`);
          }
        } else {
          logs.push(`Duplicate skipped: ${job.company} - ${job.job_title}`);
        }
      }
    }

    // Log the run
    await supabase.from("tracker_runs").insert({
      jobs_found: totalFound,
      new_jobs_added: newAdded,
      status: "success",
      log: logs.join("\n"),
    });

    return { jobs_found: totalFound, new_jobs_added: newAdded, logs };
  } catch (err: any) {
    const errorLog = [...logs, `Error: ${err.message}`].join("\n");
    await supabase.from("tracker_runs").insert({
      jobs_found: totalFound,
      new_jobs_added: newAdded,
      status: "error",
      log: errorLog,
    });
    throw err;
  }
}
