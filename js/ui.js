/**
 * UI rendering functions for TransparentTax
 */

function renderTaxSummary(result) {
    document.getElementById('gross-income').textContent = formatDKK(result.grossIncome);
    document.getElementById('am-bidrag').textContent = '−' + formatDKK(result.amBidrag);
    document.getElementById('income-after-am').textContent = formatDKK(result.incomeAfterAM);
    document.getElementById('personfradrag').textContent = '−' + formatDKK(result.personfradrag);
    document.getElementById('bundskat').textContent = formatDKK(result.bundskat);
    document.getElementById('topskat').textContent = formatDKK(result.topskat);
    document.getElementById('kommuneskat').textContent = formatDKK(result.kommuneskat);
    document.getElementById('kirkeskat').textContent = formatDKK(result.kirkeskat);
    document.getElementById('total-tax').textContent = formatDKK(result.totalTax);
    document.getElementById('net-income').textContent = formatDKK(result.netIncome);
    document.getElementById('effective-rate').textContent = result.effectiveRate.toFixed(1) + '%';

    // Show/hide kirkeskat row
    document.getElementById('kirkeskat-row').style.display =
        result.kirkeskat > 0 ? 'flex' : 'none';

    // Update the tax bar
    renderTaxBar(result);
}

function renderTaxBar(result) {
    const gross = result.grossIncome;
    if (gross === 0) return;

    const segments = [
        { id: 'bar-net', value: result.netIncome },
        { id: 'bar-am', value: result.amBidrag },
        { id: 'bar-bund', value: result.bundskat },
        { id: 'bar-top', value: result.topskat },
        { id: 'bar-kommune', value: result.kommuneskat },
        { id: 'bar-kirke', value: result.kirkeskat },
    ];

    segments.forEach(seg => {
        const el = document.getElementById(seg.id);
        const pct = (seg.value / gross) * 100;
        el.style.width = pct + '%';
        el.style.display = pct < 0.5 ? 'none' : 'flex';
    });
}

function renderBreakdown(totalTax) {
    const allocations = calculateBudgetAllocation(totalTax);
    const grid = document.getElementById('breakdown-grid');
    document.getElementById('breakdown-total-tax').textContent = formatDKK(totalTax);

    // Find max percentage for bar scaling
    const maxPercent = Math.max(...allocations.map(a => a.percent));

    grid.innerHTML = allocations.map(cat => `
        <div class="breakdown-card">
            <div class="card-header">
                <span class="card-icon">${cat.icon}</span>
                <span class="card-title">${cat.name}</span>
            </div>
            <div class="card-amount">${formatDKK(cat.amount)}</div>
            <div class="card-percent">${cat.percent}% af din skat</div>
            <div class="card-bar">
                <div class="card-bar-fill" style="width: ${(cat.percent / maxPercent) * 100}%; background: ${cat.color};"></div>
            </div>
            <div class="card-desc">${cat.description}</div>
        </div>
    `).join('');
}

function renderImpact(totalTax) {
    const list = document.getElementById('impact-list');

    const relevantExamples = IMPACT_EXAMPLES.filter(ex => totalTax >= ex.threshold);

    list.innerHTML = relevantExamples.map(ex => `
        <div class="impact-item">
            <span class="impact-icon">${ex.icon}</span>
            <div class="impact-text">
                <h4>${ex.titleFn(totalTax)}</h4>
                <p>${ex.descFn(totalTax)}</p>
            </div>
        </div>
    `).join('');
}

function getHouseholdProfile() {
    return {
        adults: parseInt(document.getElementById('hh-adults').value),
        nursery: parseInt(document.getElementById('hh-nursery').value),
        kindergarten: parseInt(document.getElementById('hh-kindergarten').value),
        school: parseInt(document.getElementById('hh-school').value),
        highschool: parseInt(document.getElementById('hh-highschool').value),
        university: parseInt(document.getElementById('hh-university').value),
        transport: parseInt(document.getElementById('hh-transport').value),
        doctorVisits: parseInt(document.getElementById('hh-doctor').value),
        hospitalVisits: parseInt(document.getElementById('hh-hospital').value),
        library: parseInt(document.getElementById('hh-library').value) === 1,
    };
}

function renderValueComparison(totalTax) {
    const household = getHouseholdProfile();
    const { items, totalPrivate } = calculatePrivateCost(household, totalTax);

    // Verdict
    const diff = totalPrivate - totalTax;
    const verdictBox = document.getElementById('verdict-box');
    const verdictIcon = document.getElementById('verdict-icon');
    const verdictLabel = document.getElementById('verdict-label');
    const verdictDiff = document.getElementById('verdict-diff');

    document.getElementById('verdict-tax').textContent = formatDKK(totalTax);
    document.getElementById('verdict-private').textContent = formatDKK(totalPrivate);

    if (diff > 0) {
        verdictBox.className = 'verdict-box verdict-positive';
        verdictIcon.textContent = '✅';
        verdictLabel.textContent = 'Du sparer penge på det offentlige system';
        verdictDiff.innerHTML = `Du ville betale <strong>${formatDKK(diff)}</strong> mere om året for de samme services privat. Det svarer til <strong>${formatDKK(Math.round(diff / 12))}/md.</strong> ekstra.`;
    } else {
        verdictBox.className = 'verdict-box verdict-negative';
        verdictIcon.textContent = '⚠️';
        verdictLabel.textContent = 'Du betaler mere end den direkte private pris';
        verdictDiff.innerHTML = `Forskellen er <strong>${formatDKK(Math.abs(diff))}</strong> om året. Men husk: du finansierer også et sikkerhedsnet du kan falde tilbage på, og services for hele samfundet — inkl. ældre, børn og fremtidige generationer.`;
    }

    // Comparison table
    const table = document.getElementById('comparison-table');

    // Split into direct services and shared services
    const directItems = items.filter(i => !i.isShared && i.privateCost > 0);
    const sharedItems = items.filter(i => i.isShared);
    const sharedTotal = sharedItems.reduce((sum, i) => sum + i.privateCost, 0);

    let html = '';

    // Direct services header
    html += '<div class="comp-section-header">Services du bruger direkte</div>';
    directItems.forEach(item => {
        const saving = item.privateCost;
        html += `
            <div class="comp-row">
                <div class="comp-service">
                    <span class="comp-icon">${item.icon}</span>
                    <div>
                        <div class="comp-name">${item.name}</div>
                        <div class="comp-note">${item.note}</div>
                    </div>
                </div>
                <div class="comp-price">${formatDKK(saving)}</div>
            </div>`;
    });

    // Shared services header
    html += '<div class="comp-section-header">Fælles services (din andel som borger)</div>';
    sharedItems.forEach(item => {
        html += `
            <div class="comp-row comp-row-shared">
                <div class="comp-service">
                    <span class="comp-icon">${item.icon}</span>
                    <div>
                        <div class="comp-name">${item.name}</div>
                        <div class="comp-note">${item.note}</div>
                    </div>
                </div>
                <div class="comp-price">${formatDKK(item.privateCost)}</div>
            </div>`;
    });

    // Total row
    html += `
        <div class="comp-row comp-total">
            <div class="comp-service">
                <span class="comp-icon">📊</span>
                <div><div class="comp-name">Samlet privat pris</div></div>
            </div>
            <div class="comp-price comp-price-total">${formatDKK(totalPrivate)}</div>
        </div>
        <div class="comp-row comp-your-tax">
            <div class="comp-service">
                <span class="comp-icon">🧾</span>
                <div><div class="comp-name">Din faktiske skat</div></div>
            </div>
            <div class="comp-price">${formatDKK(totalTax)}</div>
        </div>
        <div class="comp-row comp-diff ${diff > 0 ? 'comp-diff-positive' : 'comp-diff-negative'}">
            <div class="comp-service">
                <span class="comp-icon">${diff > 0 ? '💰' : '📌'}</span>
                <div><div class="comp-name">${diff > 0 ? 'Du sparer' : 'Du betaler mere'}</div></div>
            </div>
            <div class="comp-price">${formatDKK(Math.abs(diff))}</div>
        </div>`;

    table.innerHTML = html;
}

function showResults() {
    const results = document.getElementById('results');
    results.classList.remove('hidden');
    // Smooth scroll to results
    setTimeout(() => {
        document.getElementById('tax-summary').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}
