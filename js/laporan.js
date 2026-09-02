/******************************************************************************
 * LAPORAN DATA AGUNAN
 * VERSION : 1.0 ENTERPRISE
 * FITUR : PREVIEW, REFRESH, EXPORT XLSX, EXPORT PDF, PRINT
 ******************************************************************************/

const LAPORAN = {
    state: {
        data: [],
        filtered: [],
        page: 1,
        pageSize: 10,
        filter: {
            keyword: "",
            cabang: "",
            status: "",
            tglAwal: "",
            tglAkhir: ""
        }
    },

    getValue(item, targetKey) {
        if (!item) return "";
        const target = targetKey.trim().toLowerCase();
        const foundKey = Object.keys(item).find(k => String(k).trim().toLowerCase() === target);
        return foundKey ? item[foundKey] : "";
    },

    async init() {
        this.syncHeaderProfile();
        this.updateLastUpdate();
        this.registerEvents();
        await this.loadData();
    },

    syncHeaderProfile() {
        if (typeof Auth === "undefined") return;
        const user = Auth.getUser();
        if (user) {
            const elUsername = document.getElementById("username");
            const elRole = document.getElementById("role");
            const elAvatar = document.getElementById("avatar");

            if (elUsername) elUsername.textContent = user.nama || "Administrator";
            if (elRole) elRole.textContent = user.role || "ADMIN";
            if (elAvatar) elAvatar.textContent = (user.nama || "A").charAt(0).toUpperCase();
        }
    },

    updateLastUpdate() {
        const el = document.getElementById("lastUpdate");
        if (el) el.innerHTML = new Date().toLocaleString("id-ID");
    },

    showLoading() {
        const loading = document.getElementById("loading");
        if (loading) loading.style.display = "flex";
    },

    hideLoading() {
        const loading = document.getElementById("loading");
        if (loading) loading.style.display = "none";
    },

    async loadData() {
        try {
            this.showLoading();
            const result = await API.getAgunan();

            if (!result.success) {
                alert(result.message);
                return;
            }

            this.state.data = result.data || [];
            this.state.filtered = [...this.state.data];
            this.state.page = 1;

            this.loadCabang();
            this.loadJenisDokumen();
            this.updateKPI();
            this.renderTable();

        } catch (err) {
            console.error(err);
            alert(err.message || "Gagal mengambil data laporan.");
        } finally {
            this.hideLoading();
        }
    },

    loadCabang() {
        const select = document.getElementById("filterCabang");
        if (!select) return;

        // Simpan nilai pilihan saat ini jika ada
        const currentValue = select.value;

        select.innerHTML = '<option value="">Semua Cabang</option>';
        const cabang = [...new Set(this.state.data.map(x => this.getValue(x, "kode_cabang")).filter(Boolean))];

        cabang.sort();
        cabang.forEach(item => {
            select.innerHTML += `<option value="${item}">${item}</option>`;
        });

        select.value = currentValue;
    },

    loadJenisDokumen() {

        const select =
            document.getElementById("filterDokumen");

        if (!select) return;

        const currentValue =
            select.value;

        select.innerHTML =
            '<option value="">Semua Jenis Dokumen</option>';

        const dokumen = [
            ...new Set(
                this.state.data
                    .map(item =>
                        this.getValue(
                            item,
                            "jenis_dokumen"
                        )
                    )
                    .map(value =>
                        String(value).trim()
                    )
                    .filter(Boolean)
            )
        ];

        dokumen.sort((a, b) =>
            a.localeCompare(
                b,
                "id-ID",
                {
                    sensitivity: "base"
                }
            )
        );

        dokumen.forEach(item => {

            const option =
                document.createElement("option");

            option.value = item;
            option.textContent = item;

            select.appendChild(option);

        });

        select.value = currentValue;
    },

    updateKPI() {

        const data = this.state.filtered || [];

        const total = data.length;

        const aktif =
            data.filter(x =>
                String(
                    this.getValue(x, "status_agunan")
                )
                    .trim()
                    .toUpperCase() === "A"
            ).length;

        const belum =
            data.filter(x =>
                String(
                    this.getValue(x, "status_agunan")
                )
                    .trim()
                    .toUpperCase() === "BL"
            ).length;

        const expired =
            data.filter(x =>
                String(
                    this.getValue(x, "status_agunan")
                )
                    .trim()
                    .toUpperCase() === "E"
            ).length;

        const nonaktif =
            data.filter(x =>
                String(
                    this.getValue(x, "status_agunan")
                )
                    .trim()
                    .toUpperCase() === "D"
            ).length;


        // EXECUTIVE HEALTH
        // A / (A + BL + E) × 100
        // D / NON AKTIF TIDAK DIHITUNG

        const relevantTotal =
            aktif + belum + expired;

        const health =
            relevantTotal === 0
                ? 0
                : Math.round(
                    (aktif / relevantTotal) * 100
                );

        const pct = value =>
            relevantTotal
                ? Math.round(
                    (value / relevantTotal) * 100
                )
                : 0;

        const aktifPct = pct(aktif);
        const expiredPct = pct(expired);
        const belumPct = pct(belum);

        // =====================================================
        // UPDATE KPI KE HTML
        // =====================================================

        const setText = (id, value) => {
            const el = document.getElementById(id);

            if (el) {
                el.textContent = value;
            }
        };


        // KPI UTAMA
        setText(
            "kpiTotal",
            total.toLocaleString("id-ID")
        );

        setText(
            "kpiAktif",
            aktif.toLocaleString("id-ID")
        );

        setText(
            "kpiExpired",
            expired.toLocaleString("id-ID")
        );

        setText(
            "kpiBL",
            belum.toLocaleString("id-ID")
        );


        // SUMMARY
        setText(
            "summaryTotal",
            total.toLocaleString("id-ID")
        );

        setText(
            "summaryAktif",
            aktif.toLocaleString("id-ID")
        );

        setText(
            "summaryExpired",
            expired.toLocaleString("id-ID")
        );

        setText(
            "summaryBL",
            belum.toLocaleString("id-ID")
        );

        setText(
            "toolbarTotal",
            total.toLocaleString("id-ID")
        );


        // =====================================================
        // EXECUTIVE RATE
        // =====================================================

        setText(
            "kpiAktifRate",
            `${aktifPct}% of relevant portfolio`
        );

        setText(
            "kpiExpiredRate",
            `${expiredPct}% of relevant portfolio`
        );

        setText(
            "kpiBLRate",
            `${belumPct}% of relevant portfolio`
        );


        // =====================================================
        // CURRENT CUSTODY HEALTH
        // =====================================================

        setText(
            "healthPercent",
            `${health}%`
        );

        setText(
            "summaryAktifExec",
            aktif.toLocaleString("id-ID")
        );

        setText(
            "summaryExpiredExec",
            expired.toLocaleString("id-ID")
        );

        setText(
            "summaryBLExec",
            belum.toLocaleString("id-ID")
        );


        // =====================================================
        // PROGRESS BAR
        // =====================================================

        const progress =
            document.getElementById(
                "healthProgress"
            );

        if (progress) {
            progress.style.width =
                `${health}%`;
        }


        // =====================================================
        // HEALTH RING
        // =====================================================

        const ring =
            document.getElementById(
                "healthRing"
            );

        if (ring) {

            const ringColor =
                health >= 95
                    ? "#16805C"
                    : health >= 85
                        ? "#B7791F"
                        : health > 0
                            ? "#C2413B"
                            : "#D8E1EA";

            ring.style.borderTopColor =
                ringColor;

            ring.style.borderRightColor =
                health > 0
                    ? ringColor
                    : "#D8E1EA";

            ring.style.borderBottomColor =
                "#E8EEF5";

            ring.style.borderLeftColor =
                "#E8EEF5";
        }


        // =====================================================
        // EXECUTIVE NARRATIVE
        // =====================================================

        const narrative =
            document.getElementById(
                "executiveNarrative"
            );

        if (narrative) {

            if (!relevantTotal) {

                narrative.textContent =
                    "Belum terdapat data aktif yang relevan pada scope laporan yang dipilih.";

            } else if (health >= 95) {

                narrative.textContent =
                    `Posisi custody berada pada kondisi terkendali. ${aktif.toLocaleString("id-ID")} record aktif dari ${relevantTotal.toLocaleString("id-ID")} record relevan (${health}%).`;

            } else if (health >= 85) {

                narrative.textContent =
                    `Posisi custody memerlukan perhatian terbatas. ${aktif.toLocaleString("id-ID")} record aktif (${health}%), dengan ${belum.toLocaleString("id-ID")} record belum lengkap dan ${expired.toLocaleString("id-ID")} expired.`;

            } else {

                narrative.textContent =
                    `Posisi custody memerlukan perhatian manajemen. Active position berada di ${health}%, dengan ${expired.toLocaleString("id-ID")} expired dan ${belum.toLocaleString("id-ID")} record belum lengkap.`;

            }
        }


        // =====================================================
        // FILTER STATUS
        // =====================================================

        const statusText =
            document.getElementById(
                "filterStatusText"
            );

        if (statusText) {

            const filter =
                this.state.filter || {};

            const scope = [
                filter.tglAwal
                    ? `From ${filter.tglAwal}`
                    : "",

                filter.tglAkhir
                    ? `To ${filter.tglAkhir}`
                    : "",

                filter.cabang
                    ? `Branch ${filter.cabang}`
                    : "",

                filter.status
                    ? `Status ${filter.status}`
                    : ""
            ].filter(Boolean);

            statusText.innerHTML =
                `<i class="fa-solid fa-circle-check"></i> ${scope.length
                    ? scope.join(" • ")
                    : "All records"
                }`;
        }


        // =====================================================
        // EXECUTIVE CONTEXT
        // =====================================================

        const context =
            document.getElementById(
                "executiveContext"
            );

        if (context) {

            context.textContent =
                relevantTotal
                    ? `${relevantTotal.toLocaleString("id-ID")} relevant records in current scope`
                    : "No relevant records in current scope";
        }
    },



    getBadge(status) {
        switch (String(status).trim().toUpperCase()) {
            case "A": return '<span class="badge" style="background:#10B981;color:#fff;padding:4px 8px;border-radius:4px;font-size:12px;">AKTIF</span>';
            case "BL": return '<span class="badge" style="background:#F59E0B;color:#fff;padding:4px 8px;border-radius:4px;font-size:12px;">BELUM LENGKAP</span>';
            case "E": return '<span class="badge" style="background:#EF4444;color:#fff;padding:4px 8px;border-radius:4px;font-size:12px;">EXPIRED</span>';
            case "D": return '<span class="badge" style="background:#6B7280;color:#fff;padding:4px 8px;border-radius:4px;font-size:12px;">NON AKTIF</span>';
            default: return `<span class="badge">${status}</span>`;
        }
    },

    formatDate(dateStr) {
        if (!dateStr) return "-";
        const match = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (match) return `${match[3]}/${match[2]}/${match[1]}`;
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "-";
        return d.toLocaleDateString("id-ID");
    },

    renderTable() {
        const tbody = document.querySelector("#tblReport tbody");
        if (!tbody) return;

        tbody.innerHTML = "";

        if (this.state.filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="empty-data" style="text-align:center;padding:20px;">Belum ada data / Data tidak ditemukan.</td></tr>`;
            this.updatePageInfo();
            return;
        }

        const start = (this.state.page - 1) * this.state.pageSize;
        const end = start + this.state.pageSize;
        const rows = this.state.filtered.slice(start, end);

        rows.forEach((item, index) => {
            tbody.innerHTML += `
            <tr>
                <td>${start + index + 1}</td>
                <td>${this.getValue(item, "no_agunan")}</td>
                <td>${this.getValue(item, "cif_debitur")}</td>
                <td>${this.getValue(item, "nama_pemilik_agunan")}</td>
                <td>${this.getValue(item, "kode_cabang")}</td>
                <td>${this.getValue(item, "jenis_dokumen")}</td>
                <td>${this.getValue(item, "kode_jenis_agunan")}</td>
                <td>${this.getValue(item, "document_description")}</td>
                <td>${this.getBadge(this.getValue(item, "status_agunan"))}</td>
                <td>${this.formatDate(this.getValue(item, "tanggal_expired_appraisal"))}</td>
            </tr>`;
        });

        this.updatePageInfo();
    },

    applyFilter() {
        // Ambil data langsung dari elemen input form agar akurat saat tombol Preview diklik
        const keywordEl = document.getElementById("txtKeyword");
        const cabangEl = document.getElementById("filterCabang");
        const statusEl = document.getElementById("filterStatus");
        const tglAwalEl = document.getElementById("tanggalAwal");
        const tglAkhirEl = document.getElementById("tanggalAkhir");
        const dokumenEl = document.getElementById("filterDokumen");

        const keyword = keywordEl ? keywordEl.value.toLowerCase() : "";
        const cabang = cabangEl ? cabangEl.value : "";
        const status = statusEl ? statusEl.value : "";
        const tglAwal = tglAwalEl ? tglAwalEl.value : "";
        const tglAkhir = tglAkhirEl ? tglAkhirEl.value : "";
        const dokumen = dokumenEl ? dokumenEl.value : "";

        this.state.filtered = this.state.data.filter(item => {
            const itemNo = String(this.getValue(item, "no_agunan")).toLowerCase();
            const itemCif = String(this.getValue(item, "cif_debitur")).toLowerCase();
            const itemNama = String(this.getValue(item, "nama_pemilik_agunan")).toLowerCase();
            const itemCabang = String(this.getValue(item, "kode_cabang"));
            const itemStatus = String(this.getValue(item, "status_agunan")).trim().toUpperCase();
            const itemTgl = String(this.getValue(item, "tanggal_expired_appraisal"));
            const itemJenisDokumen = String(this.getValue(item, "jenis_dokumen")).trim();

            const matchKeyword = keyword === "" || itemNo.includes(keyword) || itemCif.includes(keyword) || itemNama.includes(keyword);
            const matchCabang = cabang === "" || itemCabang === cabang;
            const matchStatus = status === "" || itemStatus === status;
            const matchDokumen = dokumen === "" || itemJenisDokumen === dokumen;

            let matchDate = true;
            if (tglAwal !== "" || tglAkhir !== "") {
                const dateData = new Date(itemTgl).setHours(0, 0, 0, 0);
                if (tglAwal !== "") { if (dateData < new Date(tglAwal).setHours(0, 0, 0, 0)) matchDate = false; }
                if (tglAkhir !== "") { if (dateData > new Date(tglAkhir).setHours(0, 0, 0, 0)) matchDate = false; }
            }

            return matchKeyword &&
                matchCabang &&
                matchStatus &&
                matchDokumen &&
                matchDate;
        });

        this.state.filter = {
            keyword,
            cabang,
            status,
            tglAwal,
            tglAkhir
        };

        this.state.page = 1;
        this.updateKPI();
        this.renderTable();
    },

    updatePageInfo() {
        const totalPage = Math.ceil(this.state.filtered.length / this.state.pageSize);
        const el = document.getElementById("pageInfo");
        if (el) el.textContent = `Page ${this.state.page} of ${totalPage || 1}`;
    },

    // =======================================================
    // EXPORT EXCEL (XLSX Asli)
    // =======================================================
    exportExcel() {
        if (typeof XLSX === 'undefined') {
            alert("Sistem sedang memuat library Excel. Silakan tunggu beberapa detik dan coba lagi.");
            return;
        }
        if (this.state.filtered.length === 0) {
            alert("Tidak ada data untuk diexport!");
            return;
        }

        const exportData = this.state.filtered.map((item, index) => ({
            "No": index + 1,
            "No Agunan": this.getValue(item, "no_agunan"),
            "CIF": this.getValue(item, "cif_debitur"),
            "Nama Debitur": this.getValue(item, "nama_pemilik_agunan"),
            "Cabang": this.getValue(item, "kode_cabang"),
            "Jenis Dokumen": this.getValue(item, "jenis_dokumen"),
            "Produk": this.getValue(item, "produk"),
            "Kode Dokumen": this.getValue(item, "kode_jenis_agunan"),
            "Deskripsi Dokumen": this.getValue(item, "document_description"),
            "Status": this.getValue(item, "status_agunan"),
            "Tanggal Expired": this.formatDate(this.getValue(item, "tanggal_expired_appraisal"))
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Laporan Agunan");

        const dateStr = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `Laporan_Agunan_${dateStr}.xlsx`);
    },

    // =======================================================
    // EXPORT PDF
    // =======================================================
    exportPDF() {
        if (typeof window.jspdf === 'undefined') {
            alert("Sistem sedang memuat library PDF. Silakan tunggu beberapa detik dan coba lagi.");
            return;
        }
        if (this.state.filtered.length === 0) {
            alert("Tidak ada data untuk diexport!");
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('landscape');

        doc.setFontSize(12);
        doc.text("Laporan Data Agunan Custody", 14, 15);
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 22);

        const head = [["No", "No Agunan", "CIF", "Nama Debitur", "Cabang", "Produk", "Jenis Dokumen", "Jenis Agunan", "Deskripsi Dokumen", "Status", "Expired Appraisal"]];
        const body = this.state.filtered.map((item, index) => [
            index + 1,
            this.getValue(item, "no_agunan"),
            this.getValue(item, "cif_debitur"),
            this.getValue(item, "nama_pemilik_agunan"),
            this.getValue(item, "kode_cabang"),
            this.getValue(item, "produk"),
            this.getValue(item, "jenis_dokumen"),
            this.getValue(item, "kode_jenis_agunan"),
            this.getValue(item, "document_description"),
            this.getValue(item, "status_agunan"),
            this.formatDate(this.getValue(item, "tanggal_expired_appraisal")
            )
        ]);

        doc.autoTable({
            head: head,
            body: body,
            startY: 28,
            theme: 'grid',

            styles: {
                fontSize: 7,
                cellPadding: 2,
                valign: 'middle'
            },

            headStyles: {
                fontSize: 8,
                fillColor: [27, 85, 226],
                textColor: 255,
                fontStyle: 'bold'
            }
        });

        const dateStr = new Date().toISOString().split('T')[0];
        doc.save(`Laporan_Agunan_${dateStr}.pdf`);
    },

    // =======================================================
    // PRINT DATA
    // =======================================================
    printData() {
        if (this.state.filtered.length === 0) {
            alert("Tidak ada data untuk di-print!");
            return;
        }

        const printWindow = window.open('', '_blank', 'width=1000,height=800');

        let htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Print Laporan Agunan</title>
                <style>
                    body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; }
                    h2 { text-align: center; margin-bottom: 5px; }
                    .subtitle { text-align: center; margin-top: 0; margin-bottom: 20px; color: #555; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    th, td { border: 1px solid #333; padding: 8px; text-align: left; }
                    th { background-color: #f4f4f4; -webkit-print-color-adjust: exact; }
                </style>
            </head>
            <body>
                <h2>LAPORAN DATA AGUNAN CUSTODY</h2>
                <div class="subtitle">Dicetak pada: ${new Date().toLocaleString('id-ID')}</div>
                <table>
                    <thead>
                        <tr>
                            <th width="5%">No</th>
                            <th>No Agunan</th>
                            <th>CIF</th>
                            <th>Nama Debitur</th>
                            <th>Cabang</th>
                            <th>Jenis Dokumen</th>
                            <th>Produk</th>
                            <th>Jenis Agunan</th>
                            <th>Deskripsi Dokumen</th>
                            <th>Status</th>
                            <th>Expired Appraisal</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        this.state.filtered.forEach((item, index) => {
            htmlContent += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${this.getValue(item, "no_agunan")}</td>
                    <td>${this.getValue(item, "cif_debitur")}</td>
                    <td>${this.getValue(item, "nama_pemilik_agunan")}</td>
                    <td>${this.getValue(item, "kode_cabang")}</td>
                    <td>${this.getValue(item, "jenis_dokumen")}</td>
                    <td>${this.getValue(item, "produk")}</td>
                    <td>${this.getValue(item, "kode_jenis_agunan")}</td>
                    <td>${this.getValue(item, "document_description")}</td>
                    <td>${this.getValue(item, "status_agunan")}</td>
                    <td>${this.formatDate(this.getValue(item, "tanggal_expired_appraisal"))}</td>
                </tr>
            `;
        });

        htmlContent += `
                    </tbody>
                </table>
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function(){ window.close(); }, 500);
                    };
                </script>
            </body>
            </html>
        `;

        printWindow.document.open();
        printWindow.document.write(htmlContent);
        printWindow.document.close();
    },

    /**********************************************************************
     * REGISTER EVENTS
     **********************************************************************/
    registerEvents() {
        // ========================================================
        // 1. BUTTON PREVIEW (Mengeksekusi Filter Manual)
        // ========================================================
        const btnPreview = document.getElementById("btnPreview");
        if (btnPreview) {
            btnPreview.addEventListener("click", () => {
                this.applyFilter();
                // Beri efek umpan balik visual bahwa tombol ditekan
                const originalText = btnPreview.innerHTML;
                btnPreview.innerHTML = '<i class="fa-solid fa-check"></i> Loaded';
                setTimeout(() => {
                    btnPreview.innerHTML = originalText;
                }, 1000);
            });
        }

        // ========================================================
        // 2. BUTTON REFRESH (Mengambil ulang data terbaru dari Server/API)
        // ========================================================
        const btnRefresh = document.getElementById("btnRefresh");
        if (btnRefresh) {
            btnRefresh.addEventListener("click", async () => {
                btnRefresh.disabled = true;
                const originalHtml = btnRefresh.innerHTML;
                btnRefresh.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Loading...';

                this.updateLastUpdate();
                await this.loadData();

                // Reset form filter input
                const keywordEl = document.getElementById("txtKeyword");
                const cabangEl = document.getElementById("filterCabang");
                const statusEl = document.getElementById("filterStatus");
                const tglAwalEl = document.getElementById("tanggalAwal");
                const tglAkhirEl = document.getElementById("tanggalAkhir");
                const dokumenEl = document.getElementById("filterDokumen");

                if (keywordEl) keywordEl.value = "";
                if (cabangEl) cabangEl.value = "";
                if (statusEl) statusEl.value = "";
                if (tglAwalEl) tglAwalEl.value = "";
                if (tglAkhirEl) tglAkhirEl.value = "";

                btnRefresh.disabled = false;
                btnRefresh.innerHTML = originalHtml;
            });
        }

        // ========================================================
        // 3. BUTTON EXPORT EXCEL
        // ========================================================
        document.getElementById("btnExcel")?.addEventListener("click", () => {
            this.exportExcel();
        });

        // ========================================================
        // 4. BUTTON EXPORT PDF
        // ========================================================
        document.getElementById("btnPDF")?.addEventListener("click", () => {
            this.exportPDF();
        });

        // ========================================================
        // 5. BUTTON PRINT
        // ========================================================
        document.getElementById("btnPrint")?.addEventListener("click", () => {
            this.printData();
        });

        // Pagination Events
        document.getElementById("btnPrev")?.addEventListener("click", () => {
            if (this.state.page > 1) {
                this.state.page--;
                this.renderTable();
            }
        });
        document.getElementById("btnNext")?.addEventListener("click", () => {
            const totalPage = Math.ceil(this.state.filtered.length / this.state.pageSize);
            if (this.state.page < totalPage) {
                this.state.page++;
                this.renderTable();
            }
        });

        // ========================================================
        // LOGOUT CONFIRMATION
        // ========================================================

        document.getElementById("btnLogout")?.addEventListener("click", () => {

            const confirmed = window.confirm(
                "Apakah Anda ingin logout dari Enterprise Reporting Center?"
            );

            if (!confirmed) {
                return;
            }

            if (
                typeof Auth !== "undefined" &&
                typeof Auth.logout === "function"
            ) {
                Auth.logout();
            }
        });
    }
};

/**********************************************************************
 * JALANKAN KETIKA HALAMAN SELESAI DIMUAT
 **********************************************************************/
document.addEventListener("DOMContentLoaded", () => {
    LAPORAN.init();
});
