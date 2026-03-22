// Upload page interactions for the public Amplifi site
(function () {
    const STORAGE_KEY = 'amplifi_recent_uploads';

    function getRecentUploads() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch (error) {
            console.warn('Failed to read uploads:', error);
            return [];
        }
    }

    function saveRecentUploads(items) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 5)));
    }

    function buttonByLabel(label) {
        return Array.from(document.querySelectorAll('button')).find((button) => button.textContent.trim() === label);
    }

    function createHiddenInput() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'video/*';
        input.style.display = 'none';
        document.body.appendChild(input);
        return input;
    }

    function renderRecentUploads() {
        const marker = Array.from(document.querySelectorAll('h2, h3')).find((node) => node.textContent.trim() === 'Recent Uploads');
        if (!marker) {
            return;
        }

        const existing = document.getElementById('recentUploadsList');
        if (existing) {
            existing.remove();
        }

        const uploads = getRecentUploads();
        const container = document.createElement('div');
        container.id = 'recentUploadsList';
        container.style.marginTop = '16px';

        if (!uploads.length) {
            const empty = document.createElement('p');
            empty.textContent = 'No local uploads yet. Choose a file to add it here.';
            empty.style.color = '#666';
            container.appendChild(empty);
            marker.insertAdjacentElement('afterend', container);
            return;
        }

        uploads.forEach((upload) => {
            const card = document.createElement('div');
            card.style.padding = '12px 14px';
            card.style.border = '1px solid #e5e7eb';
            card.style.borderRadius = '12px';
            card.style.marginTop = '10px';
            card.innerHTML = `
                <strong>${upload.name}</strong><br>
                <span style="color:#666;font-size:14px;">${upload.sizeLabel} • ${upload.addedAt}</span>
            `;
            container.appendChild(card);
        });

        marker.insertAdjacentElement('afterend', container);
    }

    function addUpload(file) {
        const uploads = getRecentUploads();
        uploads.unshift({
            name: file.name,
            sizeLabel: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            addedAt: new Date().toLocaleString()
        });
        saveRecentUploads(uploads);
        renderRecentUploads();
    }

    document.addEventListener('DOMContentLoaded', function () {
        const chooseFileButton = buttonByLabel('Choose File');
        const editorButton = buttonByLabel('Open Editor');
        const scheduleButton = buttonByLabel('Schedule');
        const startLiveButton = buttonByLabel('Start Live');
        const createMomentButton = buttonByLabel('Create');
        const fileInput = createHiddenInput();

        if (chooseFileButton) {
            chooseFileButton.addEventListener('click', function () {
                if (window.amplifiAuth && !window.amplifiAuth.isAuthenticated()) {
                    const currentPage = window.location.pathname.split('/').pop() || 'upload.html';
                    window.location.href = `login.html?redirect=${encodeURIComponent(currentPage)}`;
                    return;
                }
                fileInput.click();
            });
        }

        fileInput.addEventListener('change', function () {
            const file = fileInput.files && fileInput.files[0];
            if (!file) {
                return;
            }
            addUpload(file);
            alert(`Added ${file.name} to your recent uploads.`);
            fileInput.value = '';
        });

        if (editorButton) {
            editorButton.addEventListener('click', function () {
                window.location.href = 'video-editor.html';
            });
        }

        if (scheduleButton) {
            scheduleButton.addEventListener('click', function () {
                window.location.href = 'schedule.html';
            });
        }

        if (startLiveButton) {
            startLiveButton.addEventListener('click', function () {
                window.location.href = 'live.html';
            });
        }

        if (createMomentButton) {
            createMomentButton.addEventListener('click', function () {
                window.location.href = 'moments.html';
            });
        }

        renderRecentUploads();
    });
})();
