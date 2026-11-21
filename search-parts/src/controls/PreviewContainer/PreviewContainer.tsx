import * as React from 'react';
import { IPreviewContainerProps, PreviewType } from './IPreviewContainerProps';
import IPreviewContainerState from './IPreviewContainerState';
import { Callout } from '@fluentui/react';
import { Spinner, SpinnerSize } from '@fluentui/react';
import previewContainerStyles from './PreviewContainer.module.scss';
import { IconButton } from '@fluentui/react';
import { Overlay } from '@fluentui/react';
import { TestConstants } from '../../common/Constants';

export default class PreviewContainer extends React.Component<IPreviewContainerProps, IPreviewContainerState> {
    private readonly scrollPosition: { left: number; top: number };

    public constructor(props: IPreviewContainerProps) {
        super(props);
        this.scrollPosition = {
            left: window.scrollX,
            top: window.scrollY
        };
        this.state = {
            showCallout: false,
            isLoading: true
        };

        this._onCloseCallout = this._onCloseCallout.bind(this);
        this._onRestoreFocus = this._onRestoreFocus.bind(this);
    }

    public render(): React.ReactElement<IPreviewContainerProps> {

        let renderPreview: JSX.Element = null;

        switch (this.props.previewType) {
            case PreviewType.Document:
                renderPreview = <div data-ui-test-id={TestConstants.PreviewCallout} className={`${previewContainerStyles.iframeContainer} ${this.state.isLoading ? previewContainerStyles.hide : ''}`}>
                                    <iframe 
                                        src={this.props.elementUrl} frameBorder="0"
                                        allowFullScreen
                                        allowTransparency
                                        onLoad={() => { this.setState({ isLoading: false}); }}
                                    >
                                    </iframe>
                                </div>;
            break;

            default:
                break;
        }

        let renderLoading: JSX.Element = this.state.isLoading ? <Overlay isDarkThemed={false} className={previewContainerStyles.overlay}><Spinner size={ SpinnerSize.large }/></Overlay>: null;
        let backgroundImage = this.state.isLoading ? `url('${this.props.previewImageUrl}')` : 'none';
 

        return !this.state.showCallout ? null :  <Callout 
                    gapSpace={0} 
                    target={this.props.targetElement} 
                    hidden={false} 
                    className={`${!this.state.showCallout ? previewContainerStyles.hide : ''} ${previewContainerStyles.calloutContainer}`}
                    onDismiss={this.props.previewType === PreviewType.Document ? this._onCloseCallout: null}
                    onRestoreFocus={this._onRestoreFocus}
                    setInitialFocus={true}
                    preventDismissOnScroll={true}
                    >
                    <div className={previewContainerStyles.calloutHeader}>
                        <IconButton iconProps={{
                            iconName: 'ChromeClose'
                        }}
                        onClick={this._onCloseCallout}></IconButton>
                    </div>
                    <div className={previewContainerStyles.calloutContentContainer} style={{backgroundImage: backgroundImage}}>
                        {renderLoading}
                        {renderPreview}
                    </div>
                </Callout>;
    }

    public componentDidMount() {
        this.setState({
            showCallout: this.props.showPreview,
            isLoading: true
        });
    }   

    public UNSAFE_componentWillReceiveProps(nextProps: IPreviewContainerProps) {
        this.setState({
            showCallout: nextProps.showPreview
        });
    }

    private _onCloseCallout() {

        this.setState({
            showCallout: false
        });

        if (this.props.onClose) {
            this.props.onClose();
        }

        window.requestAnimationFrame(() => {
            window.scrollTo(this.scrollPosition.left, this.scrollPosition.top);
        });
    }

    private _onRestoreFocus(params: { originalElement?: HTMLElement | Window | null }): void {
        if (params.originalElement instanceof HTMLElement) {
            params.originalElement.focus({ preventScroll: true });
        }

        window.requestAnimationFrame(() => {
            window.scrollTo(this.scrollPosition.left, this.scrollPosition.top);
        });
    }
}
