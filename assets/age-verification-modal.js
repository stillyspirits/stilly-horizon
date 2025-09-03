import { DialogComponent } from '@theme/dialog';

/**
 * Age Verification Modal Component
 * Extends DialogComponent to create an age verification gate
 */
class AgeVerificationModal extends DialogComponent {
  requiredRefs = ['dialog', 'form', 'formWrapper', 'errorWrapper', 'submitButton', 
                   'retryButton', 'monthInput', 'dayInput', 'yearInput',
                   'days', 'hours', 'minutes', 'seconds'];
  
  countdownInterval = null;
  cookieName = 'age_verified';
  
  connectedCallback() {
    super.connectedCallback();
    
    // Get configuration from data attributes
    this.minimumAge = parseInt(this.dataset.minimumAge || '21');
    this.cookieDays = parseInt(this.dataset.cookieDays || '30');
    
    // Check if user has already been verified
    if (!this.hasVerifiedAge()) {
      // Show modal after a short delay to ensure page is loaded
      setTimeout(() => this.showDialog(), 100);
    }
    
    this.attachEventListeners();
  }
  
  disconnectedCallback() {
    super.disconnectedCallback();
    this.clearCountdown();
  }
  
  attachEventListeners() {
    const { form, monthInput, dayInput, yearInput, submitButton, retryButton } = this.refs;
    
    // Form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.verifyAge();
    });
    
    // Input validation and auto-advance
    [monthInput, dayInput, yearInput].forEach(input => {
      input.addEventListener('input', () => {
        this.validateInput(input);
        this.updateSubmitButton();
        this.autoAdvanceInput(input);
      });
      
      input.addEventListener('keypress', (e) => {
        // Only allow numbers
        if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
          e.preventDefault();
        }
      });
    });
    
    // Retry button
    retryButton.addEventListener('click', () => this.resetForm());
  }
  
  validateInput(input) {
    const value = parseInt(input.value);
    const name = input.name;
    let isValid = false;
    
    if (name === 'month') {
      isValid = value >= 1 && value <= 12;
    } else if (name === 'day') {
      isValid = value >= 1 && value <= 31;
    } else if (name === 'year') {
      const currentYear = new Date().getFullYear();
      isValid = value >= 1900 && value <= currentYear;
    }
    
    if (input.value && !isValid) {
      input.classList.add('invalid');
    } else {
      input.classList.remove('invalid');
    }
    
    return isValid;
  }
  
  autoAdvanceInput(input) {
    const { monthInput, dayInput, yearInput } = this.refs;
    const maxLength = input === yearInput ? 4 : 2;
    
    if (input.value.length === maxLength) {
      if (input === monthInput) {
        dayInput.focus();
      } else if (input === dayInput) {
        yearInput.focus();
      }
    }
  }
  
  updateSubmitButton() {
    const { monthInput, dayInput, yearInput, submitButton } = this.refs;
    const isComplete = monthInput.value && dayInput.value && yearInput.value.length === 4;
    const isValid = this.validateInput(monthInput) && 
                   this.validateInput(dayInput) && 
                   this.validateInput(yearInput);
    
    submitButton.disabled = !(isComplete && isValid);
  }
  
  verifyAge() {
    const { monthInput, dayInput, yearInput } = this.refs;
    const month = parseInt(monthInput.value);
    const day = parseInt(dayInput.value);
    const year = parseInt(yearInput.value);
    
    const birthDate = new Date(year, month - 1, day);
    const age = this.calculateAge(birthDate);
    
    if (age >= this.minimumAge) {
      this.setVerifiedCookie(age);
      this.closeDialog();
    } else {
      this.showError(birthDate);
    }
  }
  
  calculateAge(birthDate) {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
  
  showError(birthDate) {
    const { formWrapper, errorWrapper } = this.refs;
    
    formWrapper.classList.add('hidden');
    errorWrapper.classList.remove('hidden');
    
    this.startCountdown(birthDate);
  }
  
  startCountdown(birthDate) {
    const yearsUntilLegal = this.minimumAge - this.calculateAge(birthDate);
    const legalDate = new Date(
      birthDate.getFullYear() + this.minimumAge,
      birthDate.getMonth(),
      birthDate.getDate()
    );
    
    this.countdownInterval = setInterval(() => {
      const now = new Date().getTime();
      const distance = legalDate.getTime() - now;
      
      if (distance < 0) {
        this.clearCountdown();
        this.resetForm();
        return;
      }
      
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      this.refs.days.textContent = days.toString().padStart(2, '0');
      this.refs.hours.textContent = hours.toString().padStart(2, '0');
      this.refs.minutes.textContent = minutes.toString().padStart(2, '0');
      this.refs.seconds.textContent = seconds.toString().padStart(2, '0');
    }, 1000);
  }
  
  clearCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }
  
  resetForm() {
    const { form, formWrapper, errorWrapper, monthInput } = this.refs;
    
    this.clearCountdown();
    form.reset();
    formWrapper.classList.remove('hidden');
    errorWrapper.classList.add('hidden');
    monthInput.focus();
    this.updateSubmitButton();
  }
  
  hasVerifiedAge() {
    return this.getCookie(this.cookieName) !== null;
  }
  
  setVerifiedCookie(age) {
    const date = new Date();
    date.setTime(date.getTime() + (this.cookieDays * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${this.cookieName}=${age};${expires};path=/;SameSite=Strict`;
  }
  
  getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }
  
  showDialog() {
    const { dialog } = this.refs;
    
    // Make dialog modal (can't be closed by clicking outside or ESC)
    dialog.addEventListener('cancel', (e) => {
      e.preventDefault();
    });
    
    // Override parent showDialog to make it truly modal
    dialog.showModal();
    document.body.classList.add('age-verification-active');
    
    // Focus first input
    this.refs.monthInput.focus();
  }
  
  closeDialog() {
    super.closeDialog();
    document.body.classList.remove('age-verification-active');
  }
}

// Register the custom element
customElements.define('age-verification-modal', AgeVerificationModal);