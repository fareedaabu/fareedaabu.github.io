/* Refresh public works on page load; keep the saved list if ORCID is unavailable. */
(() => {
  const container = document.getElementById('orcid-publications');
  const status = document.getElementById('orcid-status');
  if (!container || !status) return;

  const orcid = container.dataset.orcid;
  const profile = `https://orcid.org/${orcid}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  function safeUrl(value) {
    try {
      const url = new URL(value);
      return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
    } catch {
      return null;
    }
  }

  function dateKey(work) {
    const date = work['publication-date'];
    return ['year', 'month', 'day']
      .map((part) => (date?.[part]?.value || '0').padStart(part === 'year' ? 4 : 2, '0'))
      .join('-');
  }

  async function refresh() {
    try {
      const response = await fetch(`https://pub.orcid.org/v3.0/${orcid}/works`, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
        credentials: 'omit'
      });
      if (!response.ok) throw new Error('ORCID request failed');
      const data = await response.json();
      if (!Array.isArray(data.group)) throw new Error('Invalid ORCID response');

      // ORCID groups multiple records of the same work. Use the preferred record.
      const works = data.group.map((group) =>
        [...(group['work-summary'] || [])].sort((a, b) =>
          Number(b['display-index'] || 0) - Number(a['display-index'] || 0)
        )[0]
      ).filter((work) => work?.title?.title?.value);
      works.sort((a, b) => dateKey(b).localeCompare(dateKey(a)));

      const list = document.createElement('ul');
      for (const work of works) {
        const item = document.createElement('li');
        const link = document.createElement('a');
        const doi = work['external-ids']?.['external-id']?.find((id) =>
          id['external-id-type'] === 'doi' && id['external-id-relationship'] === 'self'
        );
        link.href = (doi && safeUrl(`https://doi.org/${doi['external-id-value']}`)) ||
          safeUrl(work.url?.value) || profile;
        link.textContent = work.title.title.value;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        const details = document.createElement('p');
        const type = (work.type || 'work').replaceAll('-', ' ');
        details.textContent = [
          work['publication-date']?.year?.value,
          work['journal-title']?.value,
          type.charAt(0).toUpperCase() + type.slice(1)
        ].filter(Boolean).join(' · ');
        item.append(link, details);
        list.append(item);
      }
      container.replaceChildren(list);
      status.textContent = works.length ? 'Updated from ORCID.' : 'No public works are currently listed on ORCID.';
    } catch {
      status.textContent = 'Showing saved publications. Visit my ORCID record for the latest list.';
    } finally {
      clearTimeout(timeout);
    }
  }

  refresh();
})();
