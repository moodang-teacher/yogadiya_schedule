let currentCell = null;
const classNames = {
	'flying-lv0': '플라잉 Lv0',
	'flying-lv05': '플라잉 Lv0.5',
	'flying-lv05-easy': '플라잉 Lv0.5(쉬운)',
	'flying-lv07': '플라잉 Lv0.7',
	'flying-lv1': '플라잉 Lv1',
	'low-flying': '로우플라잉',
	'kids-flying': '키즈플라잉',
	therapy: '도구테라피',
	'inside-flow': '인사이드플로우',
	healing: '힐링빈야사',
	personal: '개인레슨',
	instructor: '지도자과정',
};

// 셀 클릭 이벤트 리스너 추가
document.addEventListener('DOMContentLoaded', function () {
	document.querySelectorAll('.class-cell').forEach((cell) => {
		cell.addEventListener('click', function () {
			currentCell = this;
			openModal();
		});
	});
});

function openModal() {
	const modal = document.getElementById('editModal');
	const classType = document.getElementById('classType');
	const startHour = document.getElementById('startHour');
	const startMinute = document.getElementById('startMinute');

	// 현재 셀의 클래스와 시간 정보를 모달에 설정
	if (currentCell) {
		// 클래스 타입 설정
		for (const [value, className] of Object.entries(classNames)) {
			if (currentCell.classList.contains(value)) {
				classType.value = value;
				break;
			}
		}

		// 시작 시간 설정
		const timeMatch = currentCell.textContent.match(
			/\((\d+):(\d+)\s*(am|pm)\)/i
		);
		if (timeMatch) {
			let hour = parseInt(timeMatch[1]);
			const minute = timeMatch[2];
			const period = timeMatch[3].toLowerCase();

			if (period === 'pm' && hour < 12) hour += 12;
			if (period === 'am' && hour === 12) hour = 0;

			startHour.value = hour.toString().padStart(2, '0');
			startMinute.value = minute;
		} else {
			startHour.value = '';
			startMinute.value = '';
		}
	}

	modal.style.display = 'block';
}

function closeModal() {
	document.getElementById('editModal').style.display = 'none';
	currentCell = null;
}

function saveChanges() {
	if (!currentCell) return;

	const classType = document.getElementById('classType').value;
	const startHour = document.getElementById('startHour').value;
	const startMinute = document.getElementById('startMinute').value;

	// 기존 클래스 제거
	Object.keys(classNames).forEach((className) => {
		currentCell.classList.remove(className);
	});
	currentCell.classList.remove('empty-cell'); // empty-cell 클래스도 제거

	// 새로운 클래스 추가
	let displayText = '';
	if (classType && classType !== 'none') {
		currentCell.classList.add(classType);
		displayText = classNames[classType];

		// 시간과 분을 설정
		if (startHour && startMinute) {
			const hour = parseInt(startHour);
			const period = hour >= 12 ? 'pm' : 'am';
			const formattedHour = hour > 12 ? hour - 12 : hour;
			displayText = `(${formattedHour}:${startMinute} ${period}) ${displayText}`;
		}

		currentCell.textContent = displayText;
	} else {
		currentCell.textContent = '';
		currentCell.classList.add('empty-cell');
	}

	// 변경 사항 저장
	saveToLocalStorage();

	closeModal();
}

function saveToLocalStorage() {
	const timetableData = {};
	document.querySelectorAll('.class-cell').forEach((cell, index) => {
		timetableData[index] = {
			classType: cell.className.replace('class-cell ', '').trim(),
			textContent: cell.textContent,
		};
	});
	localStorage.setItem('timetableData', JSON.stringify(timetableData));
}

// 이미지 저장 함수 추가
function saveAsImage() {
	const container = document.createElement('div');
	container.style.backgroundColor = '#faa9ac';
	container.style.padding = '20px 20px 40px';
	container.style.position = 'fixed';
	container.style.top = '-10000px';
	container.appendChild(
		document.getElementById('tableContainer').cloneNode(true)
	);
	container.appendChild(document.querySelector('.sns-link').cloneNode(true));
	document.body.appendChild(container);

	html2canvas(container, {
		backgroundColor: '#faa9ac',
		scale: 2,
		useCORS: true,
	}).then(function (canvas) {
		const image = canvas.toDataURL('image/png');
		const link = document.createElement('a');
		link.download = `요가디야_${
			document.getElementById('currentMonth').textContent
		}월_시간표.png`;
		link.href = image;
		link.click();
		document.body.removeChild(container);
	});
}

// 현재 월을 표시하는 함수
function setCurrentMonth() {
	const currentMonth = new Date().getMonth() + 1; // getMonth()는 0부터 시작하므로 1을 더함
	document.getElementById('currentMonth').textContent = currentMonth;
}

// 페이지 로드 시 현재 월 표시
setCurrentMonth();

// 페이지 로드 시 저장된 데이터 불러오기
document.addEventListener('DOMContentLoaded', loadSavedData);

function loadSavedData() {
	const savedData = JSON.parse(localStorage.getItem('timetableData')) || {};
	document.querySelectorAll('.class-cell').forEach((cell, index) => {
		const savedClass = savedData[index];
		if (savedClass) {
			cell.className = `class-cell ${savedClass.classType}`;
			cell.textContent = savedClass.textContent;
		}
	});
}
