import { LightningElement, api } from 'lwc';

export default class FlightLogsChild extends LightningElement {
    @api logs;
    @api hasLogs;
    @api error;
    @api currentPage;
    @api totalPages;
    @api isPrevDisabled;
    @api isNextDisabled;

    handlePrevClick() {
        this.dispatchEvent(new CustomEvent('prev'));
    }

    handleNextClick() {
        this.dispatchEvent(new CustomEvent('next'));
    }
}
