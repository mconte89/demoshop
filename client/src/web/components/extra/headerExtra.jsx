import React from "react"

export default class HeaderExtra extends React.Component {
	constructor(props) {
		super(props)
	}

	render() {
		return <ul className="top-nav">
			<li className="dropdown top-nav__notifications">
				<a href="" data-toggle="dropdown" className="top-nav__notify">
					<i className="zmdi zmdi-notifications"></i>
				</a>
				<div className="dropdown-menu dropdown-menu-right dropdown-menu--block">
					<div className="listview listview--hover">
						<div className="listview__header">
							Notifications

							<div className="actions">
								<a href="" className="actions__item zmdi zmdi-check-all" data-ma-action="notifications-clear"></a>
							</div>
						</div>

						<div className="listview__scroll scrollbar-inner">
							<a href="" className="listview__item">
								<img src="demo/img/profile-pics/1.jpg" className="listview__img" alt="" />

								<div className="listview__content">
									<div className="listview__heading">David Belle</div>
									<p>Cum sociis natoque penatibus et magnis dis parturient montes</p>
								</div>
							</a>

							<a href="" className="listview__item">
								<img src="demo/img/profile-pics/2.jpg" className="listview__img" alt="" />

								<div className="listview__content">
									<div className="listview__heading">Jonathan Morris</div>
									<p>Nunc quis diam diamurabitur at dolor elementum, dictum turpis vel</p>
								</div>
							</a>

							<a href="" className="listview__item">
								<img src="demo/img/profile-pics/3.jpg" className="listview__img" alt="" />

								<div className="listview__content">
									<div className="listview__heading">Fredric Mitchell Jr.</div>
									<p>Phasellus a ante et est ornare accumsan at vel magnauis blandit turpis at augue ultricies</p>
								</div>
							</a>

							<a href="" className="listview__item">
								<img src="demo/img/profile-pics/4.jpg" className="listview__img" alt="" />

								<div className="listview__content">
									<div className="listview__heading">Glenn Jecobs</div>
									<p>Ut vitae lacus sem ellentesque maximus, nunc sit amet varius dignissim, dui est consectetur neque</p>
								</div>
							</a>

							<a href="" className="listview__item">
								<img src="demo/img/profile-pics/5.jpg" className="listview__img" alt="" />

								<div className="listview__content">
									<div className="listview__heading">Bill Phillips</div>
									<p>Proin laoreet commodo eros id faucibus. Donec ligula quam, imperdiet vel ante placerat</p>
								</div>
							</a>

							<a href="" className="listview__item">
								<img src="demo/img/profile-pics/1.jpg" className="listview__img" alt="" />

								<div className="listview__content">
									<div className="listview__heading">David Belle</div>
									<p>Cum sociis natoque penatibus et magnis dis parturient montes</p>
								</div>
							</a>

							<a href="" className="listview__item">
								<img src="demo/img/profile-pics/2.jpg" className="listview__img" alt="" />

								<div className="listview__content">
									<div className="listview__heading">Jonathan Morris</div>
									<p>Nunc quis diam diamurabitur at dolor elementum, dictum turpis vel</p>
								</div>
							</a>

							<a href="" className="listview__item">
								<img src="demo/img/profile-pics/3.jpg" className="listview__img" alt="" />

								<div className="listview__content">
									<div className="listview__heading">Fredric Mitchell Jr.</div>
									<p>Phasellus a ante et est ornare accumsan at vel magnauis blandit turpis at augue ultricies</p>
								</div>
							</a>
						</div>

						<div className="p-1"></div>
					</div>
				</div>
			</li>
		</ul>
	}
}