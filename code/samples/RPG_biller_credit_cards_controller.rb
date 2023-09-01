# Rails controller for credit cards, in the billing service to be (eventually)
# deployed for players of the RPG.

class CreditCardsController < ApplicationController

  def index
    @credit_cards = CreditCard.all
  end

  def show
    @credit_card = CreditCard.find(params[:id])
  end

  def new
    @credit_card = CreditCard.new
  end

  def edit
    @credit_card = CreditCard.find(params[:id])
  end

  def create
    @subscriber = Subscriber.find(params[:subscriber_id])
    @credit_card = @subscriber.credit_cards.create(creditcard_params)
    redirect_to subscriber_path(@subscriber)
  end

  def update
    @credit_card = CreditCard.find(params[:id])
    if @credit_card.update(creditcard_params)
      redirect_to @credit_card
    else
      render 'edit'
    end
  end

  def destroy
    @subscriber = Subscriber.find(params[:subscriber_id])
    @credit_card = @subscriber.credit_cards.destroy(creditcard_params)
    redirect_to subscriber_path(@subscriber)
  end

  private

  def creditcard_params
    params.require(:credit_card).permit(:number, :expiry_year, :expiry_month)
  end

end
