import React, { Component } from 'react';
import { getFile, putFile } from 'blockstack';
import styled from 'styled-components';

const AlertContainer = styled.div`
  background: #303032;
  border-radius: 12px;
  padding: 20px;
  margin: 16px 0;
  border: 1px solid #404042;
`;

const AlertHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const AlertTitle = styled.h3`
  color: white;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`;

const AlertForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormRow = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 200px;
`;

const Label = styled.label`
  color: #aaa;
  font-size: 14px;
  font-weight: 500;
`;

const Input = styled.input`
  background: #404042;
  border: 1px solid #555;
  border-radius: 8px;
  padding: 12px;
  color: white;
  font-size: 14px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #21ce99;
  }
  
  &::placeholder {
    color: #777;
  }
`;

const Select = styled.select`
  background: #404042;
  border: 1px solid #555;
  border-radius: 8px;
  padding: 12px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #21ce99;
  }
`;

const Button = styled.button`
  background: ${props => props.variant === 'secondary' ? '#555' : '#21ce99'};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.variant === 'secondary' ? '#666' : '#1a4d2e'};
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: #555;
    cursor: not-allowed;
    transform: none;
  }
`;

const AlertList = styled.div`
  margin-top: 20px;
`;

const AlertItem = styled.div`
  background: #404042;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  border-left: 4px solid ${props => {
    switch (props.status) {
      case 'active': return '#21ce99';
      case 'triggered': return '#ff6b6b';
      case 'dismissed': return '#777';
      default: return '#555';
    }
  }};
`;

const AlertItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const AlertItemTitle = styled.div`
  color: white;
  font-weight: 600;
  font-size: 16px;
`;

const AlertItemStatus = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    switch (props.status) {
      case 'active': return 'rgba(33, 206, 153, 0.2)';
      case 'triggered': return 'rgba(255, 107, 107, 0.2)';
      case 'dismissed': return 'rgba(119, 119, 119, 0.2)';
      default: return 'rgba(85, 85, 85, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'active': return '#21ce99';
      case 'triggered': return '#ff6b6b';
      case 'dismissed': return '#777';
      default: return '#555';
    }
  }};
`;

const AlertItemDetails = styled.div`
  color: #aaa;
  font-size: 14px;
  margin-bottom: 8px;
`;

const AlertItemActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: none;
  border: 1px solid #555;
  color: #aaa;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #21ce99;
    color: #21ce99;
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #aaa;
`;

const EmptyStateIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

class PriceAlert extends Component {
  constructor(props) {
    super(props);
    this.state = {
      alerts: [],
      loading: true,
      formData: {
        coin: props.coin || '',
        alertType: 'above',
        price: '',
        enabled: true
      },
      showForm: false,
      processingActions: new Set()
    };
  }

  componentDidMount() {
    this.loadAlerts();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.coin !== this.props.coin) {
      this.setState({
        formData: { ...this.state.formData, coin: this.props.coin || '' }
      });
    }
  }

  async loadAlerts() {
    try {
      console.log('Loading alerts from Blockstack...');
      const alerts = await getFile('price-alerts.json', { decrypt: true }) || [];
      console.log('Loaded alerts:', alerts);
      this.setState({ alerts, loading: false });
    } catch (error) {
      console.error('Error loading alerts:', error);
      this.setState({ alerts: [], loading: false });
    }
  }

  async saveAlerts(alerts) {
    try {
      console.log('Saving alerts to Blockstack:', alerts);
      await putFile('price-alerts.json', JSON.stringify(alerts), { encrypt: true });
      console.log('Alerts saved successfully');
      
      // Notify parent component about alert changes
      if (this.props.onAlertChange) {
        this.props.onAlertChange();
      }
    } catch (error) {
      console.error('Error saving alerts:', error);
    }
  }

  handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const { formData } = this.state;
    
    if (!formData.coin || !formData.price) {
      return;
    }

    const newAlert = {
      id: Date.now().toString(),
      coin: formData.coin.toLowerCase(),
      alertType: formData.alertType,
      price: parseFloat(formData.price),
      enabled: formData.enabled,
      status: 'active',
      createdAt: new Date().toISOString(),
      triggeredAt: null
    };

    const updatedAlerts = [...this.state.alerts, newAlert];
    
    // Update local state immediately for better UX
    this.setState({
      alerts: updatedAlerts,
      formData: {
        coin: this.props.coin || '',
        alertType: 'above',
        price: '',
        enabled: true
      },
      showForm: false
    });
    
    // Save to Blockstack storage
    await this.saveAlerts(updatedAlerts);
  };

  toggleAlertStatus = async (alertId, newStatus) => {
    console.log('Toggling alert status:', { alertId, newStatus });
    
    // Mark action as processing
    this.setState(prevState => ({
      processingActions: new Set(prevState.processingActions).add(`${alertId}-${newStatus}`)
    }));
    
    try {
      const updatedAlerts = this.state.alerts.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: newStatus, triggeredAt: newStatus === 'triggered' ? new Date().toISOString() : alert.triggeredAt }
          : alert
      );
      
      console.log('Updated alerts:', updatedAlerts);
      
      // Update local state immediately for better UX
      this.setState({ alerts: updatedAlerts });
      
      // Save to Blockstack storage
      await this.saveAlerts(updatedAlerts);
    } finally {
      // Remove processing state
      this.setState(prevState => {
        const newProcessingActions = new Set(prevState.processingActions);
        newProcessingActions.delete(`${alertId}-${newStatus}`);
        return { processingActions: newProcessingActions };
      });
    }
  };

  deleteAlert = async (alertId) => {
    console.log('Deleting alert:', alertId);
    
    // Mark action as processing
    this.setState(prevState => ({
      processingActions: new Set(prevState.processingActions).add(`delete-${alertId}`)
    }));
    
    try {
      const updatedAlerts = this.state.alerts.filter(alert => alert.id !== alertId);
      
      console.log('Updated alerts after deletion:', updatedAlerts);
      
      // Update local state immediately for better UX
      this.setState({ alerts: updatedAlerts });
      
      // Save to Blockstack storage
      await this.saveAlerts(updatedAlerts);
    } finally {
      // Remove processing state
      this.setState(prevState => {
        const newProcessingActions = new Set(prevState.processingActions);
        newProcessingActions.delete(`delete-${alertId}`);
        return { processingActions: newProcessingActions };
      });
    }
  };

  toggleForm = () => {
    this.setState(prevState => ({ showForm: !prevState.showForm }));
  };

  render() {
    const { alerts, loading, formData, showForm } = this.state;
    const { coin, marketData, currency } = this.props;
    
    const currentPrice = marketData && coin && marketData[coin] && marketData[coin].ticker
      ? marketData[coin].ticker.price
      : 0;

    const filteredAlerts = coin 
      ? alerts.filter(alert => alert.coin === coin.toLowerCase())
      : alerts;

    // Debug logging
    console.log('PriceAlert render:', {
      coin,
      totalAlerts: alerts.length,
      filteredAlerts: filteredAlerts.length,
      alerts: alerts,
      filteredAlerts: filteredAlerts
    });

    if (loading) {
      return (
        <AlertContainer>
          <div style={{ textAlign: 'center', color: '#aaa' }}>Loading alerts...</div>
        </AlertContainer>
      );
    }

    return (
      <AlertContainer>
        <AlertHeader>
          <AlertTitle>
            {coin ? `${coin.toUpperCase()} Price Alerts` : 'Price Alerts'}
          </AlertTitle>
          <Button onClick={this.toggleForm} variant="secondary">
            {showForm ? 'Cancel' : 'Add Alert'}
          </Button>
        </AlertHeader>

        {showForm && (
          <AlertForm onSubmit={this.handleSubmit}>
            <FormRow>
              <FormGroup>
                <Label>Coin</Label>
                <Input
                  name="coin"
                  value={formData.coin}
                  onChange={this.handleInputChange}
                  placeholder="e.g., BTC"
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Alert Type</Label>
                <Select
                  name="alertType"
                  value={formData.alertType}
                  onChange={this.handleInputChange}
                >
                  <option value="above">Above</option>
                  <option value="below">Below</option>
                </Select>
              </FormGroup>
              
              <FormGroup>
                <Label>Price Target</Label>
                <Input
                  name="price"
                  type="number"
                  step="0.00000001"
                  value={formData.price}
                  onChange={this.handleInputChange}
                  placeholder="0.00"
                  required
                />
              </FormGroup>
            </FormRow>
            
            <FormRow>
              <Button type="submit" disabled={!formData.coin || !formData.price}>
                Create Alert
              </Button>
            </FormRow>
          </AlertForm>
        )}

        <AlertList>
          {filteredAlerts.length === 0 ? (
            <EmptyState>
              <EmptyStateIcon>
                <i className="fa fa-bell-o" aria-hidden="true"></i>
              </EmptyStateIcon>
              <h4>No alerts set</h4>
              <p>Create price alerts to get notified when coins reach your target prices</p>
            </EmptyState>
          ) : (
            filteredAlerts.map(alert => (
              <AlertItem key={alert.id} status={alert.status}>
                <AlertItemHeader>
                  <AlertItemTitle>
                    {alert.coin.toUpperCase()} {alert.alertType} {alert.price}
                  </AlertItemTitle>
                  <AlertItemStatus status={alert.status}>
                    {alert.status}
                  </AlertItemStatus>
                </AlertItemHeader>
                
                <AlertItemDetails>
                  Created: {new Date(alert.createdAt).toLocaleDateString()}
                  {alert.triggeredAt && (
                    <span> • Triggered: {new Date(alert.triggeredAt).toLocaleDateString()}</span>
                  )}
                  {currentPrice > 0 && (
                    <span> • Current: {currentPrice}</span>
                  )}
                </AlertItemDetails>
                
                <AlertItemActions>
                  {alert.status === 'active' && (
                    <>
                      <ActionButton 
                        onClick={() => this.toggleAlertStatus(alert.id, 'triggered')}
                        disabled={this.state.processingActions.has(`${alert.id}-triggered`)}
                      >
                        {this.state.processingActions.has(`${alert.id}-triggered`) ? 'Processing...' : 'Mark Triggered'}
                      </ActionButton>
                      <ActionButton 
                        onClick={() => this.toggleAlertStatus(alert.id, 'dismissed')}
                        disabled={this.state.processingActions.has(`${alert.id}-dismissed`)}
                      >
                        {this.state.processingActions.has(`${alert.id}-dismissed`) ? 'Processing...' : 'Dismiss'}
                      </ActionButton>
                    </>
                  )}
                  {alert.status === 'triggered' && (
                    <ActionButton 
                      onClick={() => this.toggleAlertStatus(alert.id, 'active')}
                      disabled={this.state.processingActions.has(`${alert.id}-active`)}
                    >
                      {this.state.processingActions.has(`${alert.id}-active`) ? 'Processing...' : 'Reactivate'}
                    </ActionButton>
                  )}
                  <ActionButton 
                    onClick={() => this.deleteAlert(alert.id)}
                    disabled={this.state.processingActions.has(`delete-${alert.id}`)}
                  >
                    {this.state.processingActions.has(`delete-${alert.id}`) ? 'Deleting...' : 'Delete'}
                  </ActionButton>
                </AlertItemActions>
              </AlertItem>
            ))
          )}
        </AlertList>
      </AlertContainer>
    );
  }
}

export default PriceAlert;
