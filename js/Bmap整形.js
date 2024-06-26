//********************************************************************
// BingMaps v8
// BmapQuery: v1.0.1( https://mapapi.org/indexb.php )
// Auther:Daisuke.Yamazaki
// MIT License.
//********************************************************************
"use strict";

function _instanceof(e, t) {
	return null != t && "undefined" != typeof Symbol && t[Symbol.hasInstance] ? !!
		t[Symbol.hasInstance](e) : e instanceof t
}

function _typeof(e) {
	return (_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ?
		function(e) {
			return typeof e
		} : function(e) {
			return e && "function" == typeof Symbol && e.constructor === Symbol && e !==
				Symbol.prototype ? "symbol" : typeof e
		})(e)
}

function _classCallCheck(e, t) {
	if (!_instanceof(e, t)) throw new TypeError(
		"Cannot call a class as a function")
}

function _defineProperties(e, t) {
	for (var o = 0; o < t.length; o++) {
		var i = t[o];
		i.enumerable = i.enumerable || !1, i.configurable = !0, "value" in i && (i.writable = !
			0), Object.defineProperty(e, i.key, i)
	}
}

function _createClass(e, t, o) {
	return t && _defineProperties(e.prototype, t), o && _defineProperties(e, o), e
}
var Bmap = function() {
	function Bmap(e) {
		_classCallCheck(this, Bmap), this.target = e, this.map = null, this.size =
			10, this.typeid = "load", this.loc, this.layer = new Microsoft.Maps.Layer,
			this.watchId, this.tracker = [], this.time = [], this.infoboxs = []
	}
	return _createClass(Bmap, [{
		key: "startMap",
		value: function startMap(lat, lon, typeid, size) {
			if ("" == this.target || "" == lat || "" == lon || "" == typeid || "" ==
				size) return !1;
			this.size = size, this.typeid = typeid, this.map = new Microsoft.Maps.Map(
				this.target, {
					center: new Microsoft.Maps.Location(lat, lon),
					mapTypeId: eval("Microsoft.Maps.MapTypeId." + typeid),
					zoom: size
				})
		}
	}, {
		key: "setLocation",
		value: function(e, t) {
			return new Microsoft.Maps.Location(e, t)
		}
	}, {
		key: "getCenter",
		value: function() {
			return this.map.getCenter()
		}
	}, {
		key: "getLat",
		value: function() {
			return this.map.getCenter().latitude
		}
	}, {
		key: "getLon",
		value: function() {
			return this.map.getCenter().longitude
		}
	}, {
		key: "changeMap",
		value: function changeMap(lat, lon, id) {
			if ("" == this.map || "" == lat || "" == lon || "" == id) return !1;
			var loc = new Microsoft.Maps.Location(lat, lon);
			void 0 !== arguments[3] && "" != arguments[3] ? (this.size = arguments[
				3], this.map.setView({
				mapTypeId: eval("Microsoft.Maps.MapTypeId." + id),
				center: loc,
				zoom: this.size,
				bounds: loc.bestView
			})) : this.map.setView({
				mapTypeId: eval("Microsoft.Maps.MapTypeId." + id),
				center: loc,
				bounds: loc.bestView
			})
		}
	}, {
		key: "onMap",
		value: function(e, t) {
			if ("object" != _typeof(this.map) || "" == e || "function" != typeof t)
				return !1;
			"viewchangestart" == e && Microsoft.Maps.Events.addHandler(this.map,
					"viewchangestart", t), "viewchange" == e && Microsoft.Maps.Events.addHandler(
					this.map, "viewchange", t), "viewchangeend" == e && Microsoft.Maps.Events
				.addHandler(this.map, "viewchangeend", t), "click" == e && Microsoft.Maps
				.Events.addHandler(this.map, "click", t), "dblclick" == e && Microsoft
				.Maps.Events.addHandler(this.map, "dblclick", t), "rightclick" == e &&
				Microsoft.Maps.Events.addHandler(this.map, "rightclick", t),
				"mousedown" == e && Microsoft.Maps.Events.addHandler(this.map,
					"mousedown", t), "mouseout" == e && Microsoft.Maps.Events.addHandler(
					this.map, "mouseout", t), "mouseover" == e && Microsoft.Maps.Events.addHandler(
					this.map, "mouseover", t), "mouseup" == e && Microsoft.Maps.Events.addHandler(
					this.map, "mouseup", t), "mousewheel" == e && Microsoft.Maps.Events.addHandler(
					this.map, "mousewheel", t), "maptypechanged" == e && Microsoft.Maps.Events
				.addHandler(this.map, "maptypechanged", t)
		}
	}, {
		key: "pin",
		value: function(e, t, o) {
			var i, a, n, s;
			if ("" == this.map || "" == e || "" == t || "" == o) return !1;
			i = void 0 !== arguments[3] && 0 != arguments[3], a = void 0 !==
				arguments[4] && 0 != arguments[4], n = void 0 !== arguments[5] && 0 !=
				arguments[5], s = void 0 === arguments[6] || 1 == arguments[6];
			var r = new Microsoft.Maps.Location(e, t),
				c = new Microsoft.Maps.Pushpin(r, {
					color: o,
					draggable: i,
					enableClickedStyle: a,
					enableHoverStyle: n,
					visible: s
				});
			return this.map.entities.push(c), c
		}
	}, {
		key: "onPin",
		value: function(e, t, o) {
			if ("object" !== _typeof(e) || "" === t || "function" != typeof o)
				return !1;
			"click" == t && Microsoft.Maps.Events.addHandler(e, "click", o),
				"mousedown" == t && Microsoft.Maps.Events.addHandler(e, "mousedown", o),
				"mouseout" == t && Microsoft.Maps.Events.addHandler(e, "mouseout", o),
				"mouseover" == t && Microsoft.Maps.Events.addHandler(e, "mouseover", o),
				"mouseup" == t && Microsoft.Maps.Events.addHandler(e, "mouseup", o)
		}
	}, {
		key: "deletePin",
		value: function() {
			for (var e = this.map, t = e.entities.getLength() - 1; t >= 0; t--) {
				_instanceof(e.entities.get(t), Microsoft.Maps.Pushpin) && e.entities.removeAt(
					t)
			}
		}
	}, {
		key: "pinText",
		value: function(e, t, o, i, a) {
			if ("" == this.map || "" == e || "" == t || "" == o || "" == i || "" ==
				a) return !1;
			var n = new Microsoft.Maps.Location(e, t),
				s = new Microsoft.Maps.Pushpin(n, {
					title: o,
					subTitle: i,
					text: a
				});
			return this.map.entities.push(s), s
		}
	}, {
		key: "pinIcon",
		value: function(e, t, o, i, a, n) {
			if ("" == this.map || "" == e || "" == t || "" == o || "" == i) return !
				1;
			var s = this.map,
				r = new Microsoft.Maps.Location(e, t);
			this._createScaledPushpin(r, o, i, a, n, function(e) {
				return s.entities.push(e), e
			})
		}
	}, {
		key: "pinLayer",
		value: function(e, t, o) {
			var i, a, n, s, r = this.map;
			if ("" == this.map || "" == e || "" == t || "" == o) return !1;
			i = void 0 !== arguments[3] && 0 != arguments[3], a = void 0 !==
				arguments[4] && 0 != arguments[4], n = void 0 !== arguments[5] && 0 !=
				arguments[5], s = void 0 === arguments[6] || 1 == arguments[6];
			var c = new Microsoft.Maps.Location(e, t),
				l = new Microsoft.Maps.Pushpin(c, {
					color: o,
					draggable: i,
					enableClickedStyle: a,
					enableHoverStyle: n,
					visible: s
				});
			return this.layer.add(l), r.layers.insert(this.layer), l
		}
	}, {
		key: "infoboxLayers",
		value: function(e, t) {
			var o = this.map,
				i = [],
				a = [],
				n = [];
			if ("" == o || "object" !== _typeof(e) || 0 === e.length) return !1;
			for (var s = function(s) {
					var r = new Microsoft.Maps.Location(e[s].lat, e[s].lon);
					i[s] = new Microsoft.Maps.Layer, i[s].metadata = {
						zoomRange: {
							min: 1,
							max: 20
						}
					}, a[s] = new Microsoft.Maps.Pushpin(r, {
						color: e[s].pinColor
					}), i[s].add(a[s]), n[s] = new Microsoft.Maps.Infobox(r, {
						maxHeight: e[s].height,
						maxWidth: e[s].width,
						title: e[s].title,
						description: e[s].description,
						visible: e[s].show
					}), n[s].setMap(o), Microsoft.Maps.Events.addHandler(a[s], "click",
						function() {
							if (!0 === t)
								for (var e = 0; e < n.length; e++) n[e].setOptions({
									visible: !1
								});
							n[s].setOptions({
								visible: !0
							}), n[s].setMap(o)
						}), o.layers.insert(i[s])
				}, r = 0; r < e.length; r++) s(r)
		}
	}, {
		key: "pinLayerClear",
		value: function() {
			void 0 === arguments[0] ? this.layer.clear() : this.layer.remove(
				arguments[0])
		}
	}, {
		key: "polyline",
		value: function(e, t, o) {
			var i = {
					strokeColor: t,
					strokeThickness: o,
					strokeDashArray: "object" == _typeof(arguments[3]) ? arguments[3] : []
				},
				a = new Microsoft.Maps.Polyline(e, i);
			this.map.entities.push(a)
		}
	}, {
		key: "_createScaledPushpin",
		value: function(e, t, o, i, a, n) {
			var s = new Image;
			s.onload = function() {
				var t = document.createElement("canvas");
				t.width = s.width * o, t.height = s.height * o, t.getContext("2d").drawImage(
					s, 0, 0, t.width, t.height);
				var r = new Microsoft.Maps.Pushpin(e, {
					icon: t.toDataURL(),
					anchor: new Microsoft.Maps.Point(i, a)
				});
				n && n(r)
			}, s.src = t
		}
	}, {
		key: "infobox",
		value: function(e, t, o, i) {
			if ("" == this.map || "" == e || "" == t || "" == o || "" == i) return !
				1;
			var a = this.infoboxs.length,
				n = new Microsoft.Maps.Location(e, t);
			this.infoboxs[a] = new Microsoft.Maps.Infobox(n, {
				title: o,
				description: i
			}), this.infoboxs[a].setMap(this.map)
		}
	}, {
		key: "crearInfobox",
		value: function() {
			for (var e = this.infoboxs.length, t = 0; t < e; t++) this.infoboxs[t].setOptions({
				visible: !1
			}), this.infoboxs[t].setMap(null)
		}
	}, {
		key: "infoboxHtml",
		value: function(e, t, o) {
			if ("" == this.map || "" == e || "" == t || "" == o) return !1;
			var i = this.infoboxs.length,
				a = new Microsoft.Maps.Location(e, t);
			this.infoboxs[i] = new Microsoft.Maps.Infobox(a, {
				htmlContent: o
			}), this.infoboxs[i].setMap(this.map)
		}
	}, {
		key: "infoboxIframe",
		value: function(e, t, o, i, a, n) {
			var s = this.infoboxs.length;
			this.infoboxs[s] = new Microsoft.Maps.Infobox(this.setLocation(e, t), {
				maxHeight: o,
				maxWidth: i,
				title: a,
				description: n
			}), this.infoboxs[s].setMap(this.map)
		}
	}, {
		key: "onInfobox",
		value: function(e, t, o, i, a) {
			var n = this.infoboxs.length,
				s = this.setLocation(e, t);
			this.infoboxs[n] = new Microsoft.Maps.Infobox(s, {
				maxHeight: this.map.getHeight() - 50,
				maxWidth: this.map.getWidth() - 50,
				title: o,
				description: i,
				actions: a,
				visible: !0
			}), this.infoboxs[n].setMap(this.map)
		}
	}, {
		key: "getGeocode",
		value: async function(e, t) {
			var o = !(arguments.length > 2 && void 0 !== arguments[2]) || arguments[
				2];
			t(await this._geocodeQuery(e, o))
		}
	}, {
		key: "_geocodeQuery",
		value: function(e, t) {
			var o = this.map;
			return new Promise(function(t) {
				var i;
				Microsoft.Maps.loadModule("Microsoft.Maps.Search", function() {
					(i = new Microsoft.Maps.Search.SearchManager(o)) && i.geocode({
						where: e,
						callback: function(e, o) {
							if (e && e.results && e.results.length > 0) return t(e.results[
								0])
						},
						errorCallback: function(e) {
							return t(!1)
						}
					})
				})
			}).then(function(e) {
				return !0 === t && o.setView({
					bounds: e.bestView
				}), e.location
			})
		}
	}, {
		key: "reverseGeocode",
		value: async function(e, t) {
			t(await this._reverseGeocode(e))
		}
	}, {
		key: "_reverseGeocode",
		value: function(e) {
			var t = this.map;
			return new Promise(function(o) {
				var i;
				if (!i) {
					var a = {
						location: e,
						callback: function(e) {
							return o(e.name)
						},
						errorCallback: function(e) {
							return o("Unable to reverse geocode location.")
						}
					};
					Microsoft.Maps.loadModule("Microsoft.Maps.Search", function() {
						(i = new Microsoft.Maps.Search.SearchManager(t)).reverseGeocode(
							a)
					})
				}
			})
		}
	}, {
		key: "onGeocode",
		value: function(e, t) {
			("" !== e && "string" == typeof e || "function" != typeof t) &&
			Microsoft.Maps.Events.addHandler(this.map, e, t)
		}
	}, {
		key: "direction",
		value: function(e, t, o, i) {
			var a, n = this.map,
				s = arguments[4];
			Microsoft.Maps.loadModule("Microsoft.Maps.Directions", function() {
				a = new Microsoft.Maps.Directions.DirectionsManager(n), "walking" ==
					t ? a.setRequestOptions({
						routeMode: Microsoft.Maps.Directions.RouteMode.walking
					}) : a.setRequestOptions({
						routeMode: Microsoft.Maps.Directions.RouteMode.driving
					});
				var r = new Microsoft.Maps.Directions.Waypoint({
					address: o
				});
				a.addWaypoint(r), void 0 !== s && s.forEach(function(e) {
					var t = new Microsoft.Maps.Directions.Waypoint({
						address: e
					});
					a.addWaypoint(t)
				});
				var c = new Microsoft.Maps.Directions.Waypoint({
					address: i
				});
				a.addWaypoint(c), a.setRenderOptions({
					itineraryContainer: e
				}), Microsoft.Maps.Events.addHandler(a, "directionsError", function(
					e) {
					alert("Error: " + e.message + "\r\nResponse Code: " + e.responseCode)
				}), Microsoft.Maps.Events.addHandler(a, "directionsUpdated",
					function(e) {
						var t = a.getRequestOptions().routeIndex;
						Math.round(100 * e.routeSummary[t].distance);
						a.getRequestOptions().distanceUnit, Microsoft.Maps.Directions.DistanceUnit
							.km
					}), a.calculateDirections()
			})
		}
	}, {
		key: "selectedSuggestion",
		value: function(e, t) {
			var o = this.map;
			Microsoft.Maps.loadModule("Microsoft.Maps.AutoSuggest", function() {
				new Microsoft.Maps.AutosuggestManager({
					map: o
				}).attachAutosuggest(e, t, function(e) {
					o.entities.clear(), o.entities.push(new Microsoft.Maps.Pushpin(e.location)),
						o.setView({
							bounds: e.bestView
						})
				})
			})
		}
	}, {
		key: "traffic",
		value: function() {
			var e = this.map;
			Microsoft.Maps.loadModule("Microsoft.Maps.Traffic", function() {
				new Microsoft.Maps.Traffic.TrafficManager(e).show()
			})
		}
	}, {
		key: "getBoundary",
		value: function(e) {
			var t = this.map,
				o = {
					entityType: e
				};
			Microsoft.Maps.loadModule("Microsoft.Maps.SpatialDataService", function() {
				Microsoft.Maps.SpatialDataService.GeoDataAPIManager.getBoundary(t.getCenter(),
					o, t,
					function(e) {
						e.results && e.results.length > 0 && t.entities.push(e.results[0]
							.Polygons)
					}, null,
					function(e, t) {
						console.log(e), console.log(t)
					})
			})
		}
	}, {
		key: "getMultiBoundary",
		value: function(e) {
			var t = this.map,
				o = {
					entityType: "Postcode1"
				};
			Microsoft.Maps.loadModule("Microsoft.Maps.SpatialDataService", function() {
				Microsoft.Maps.SpatialDataService.GeoDataAPIManager.getBoundary(e, o,
					t,
					function(e) {
						e.results && e.results.length > 0 && t.entities.push(e.results[0]
							.Polygons)
					}, null,
					function(e, t, o) {
						console.log(e), console.log(t), console.log(o)
					})
			})
		}
	}, {
		key: "getSearchBoundary",
		value: function(e, t) {
			var o = this.map;
			Microsoft.Maps.loadModule(["Microsoft.Maps.SpatialDataService",
				"Microsoft.Maps.Search"
			], function() {
				var i = new Microsoft.Maps.Search.SearchManager(o),
					a = {
						where: e,
						callback: function(e) {
							if (e && e.results && e.results.length > 0) {
								o.setView({
									bounds: e.results[0].bestView
								});
								var i = {
									entityType: t,
									getAllPolygons: !0
								};
								Microsoft.Maps.SpatialDataService.GeoDataAPIManager.getBoundary(
									e.results[0].location, i, o,
									function(e) {
										e.results && e.results.length > 0 && o.entities.push(e.results[
											0].Polygons)
									}, null,
									function(e, t) {
										console.log(e), console.log(t)
									})
							}
						}
					};
				i.geocode(a)
			})
		}
	}, {
		key: "startTracking",
		value: function(e) {
			var t = this.map,
				o = this.tracker,
				i = this.time,
				a = new Microsoft.Maps.Pushpin(t.getCenter(), {
					visible: !1
				});
			t.entities.push(a), this.watchId = navigator.geolocation.watchPosition(
				function(n) {
					var s = new Microsoft.Maps.Location(n.coords.latitude, n.coords.longitude);
					a.setLocation(s), a.setOptions({
						visible: !0
					}), t.setView({
						center: s
					}), !0 === e && console.log(s), o.push(s), i.push(new Date(n.timestamp)
						.toLocaleString())
				})
		}
	}, {
		key: "stopTracking",
		value: function() {
			navigator.geolocation.clearWatch(this.watchId), this.map.entities.clear()
		}
	}, {
		key: "startTrackingDraw",
		value: function(e, t) {
			var o, i = this.map,
				a = this.tracker,
				n = this.time,
				s = !1,
				r = "",
				c = 0;
			void 0 !== arguments[2] && "" != arguments[2] && (r = arguments[2]),
				void 0 !== arguments[3] && 1 == arguments[3] && (s = !0), 0 === c &&
				navigator.geolocation.getCurrentPosition(function(e) {
					var t = new Microsoft.Maps.Location(e.coords.latitude, e.coords.longitude);
					o = new Microsoft.Maps.Pushpin(t, {
						visible: !0
					}), i.entities.push(o)
				}), this.watchId = navigator.geolocation.watchPosition(function(l) {
					var u = new Microsoft.Maps.Location(l.coords.latitude, l.coords.longitude);
					o.setLocation(u), i.setView({
						center: u
					}), a.push(u);
					var p = new Date(l.timestamp).toLocaleString();
					n.push(p);
					var f = {
						strokeColor: e,
						strokeThickness: t
					};
					i.entities.push(new Microsoft.Maps.Polyline(a, f)), 1 == s && (
						console.log(a), console.log(n)), "" != r && null != p && (document
						.querySelector(r).innerHTML = p), c++
				})
		}
	}, {
		key: "stopTrackingDraw",
		value: function() {
			navigator.geolocation.clearWatch(this.watchId)
		}
	}, {
		key: "clearMap",
		value: function() {
			this.map.entities.clear()
		}
	}, {
		key: "getTrackingData",
		value: function() {
			return this.tracker
		}
	}, {
		key: "getTrackingSpeed",
		value: function() {
			return this.time
		}
	}, {
		key: "getTrackingTime",
		value: function() {
			return this.time
		}
	}, {
		key: "clearTrackingData",
		value: function() {
			this.tracker = [], this.time = []
		}
	}, {
		key: "circle",
		value: function(e, t) {
			var o = this.map,
				i = arguments[2],
				a = arguments[3];
			Microsoft.Maps.loadModule("Microsoft.Maps.SpatialMath", function() {
				navigator.geolocation.getCurrentPosition(function(n) {
					var s = new Microsoft.Maps.Location(n.coords.latitude, n.coords.longitude);
					o.setView({
						center: s
					});
					var r = Microsoft.Maps.SpatialMath.getRegularPolygon(s, e, 36,
							Microsoft.Maps.SpatialMath.Meters),
						c = new Microsoft.Maps.Polygon(r, {
							fillColor: void 0 === t.fillColor ? "rgba(255,0,0,0.3)" : t.fillColor,
							strokeThickness: void 0 === t.strokeWidth ? 0 : t.strokeWidth
						});
					o.entities.push(c), "click" !== i && "mousedown" !== i &&
						"mouseout" !== i && "mouseover" !== i && "mouseup" !== i ||
						"function" != typeof a || Microsoft.Maps.Events.addHandler(c, i,
							a);
					var l = new Microsoft.Maps.Pushpin(s, {
						color: void 0 === t.pinColor ? "#ff0000" : t.pinColor
					});
					o.entities.push(l)
				})
			})
		}
	}, {
		key: "circleSet",
		value: function(e, t, o, i) {
			var a = this.map,
				n = arguments[4],
				s = arguments[5];
			Microsoft.Maps.loadModule("Microsoft.Maps.SpatialMath", function() {
				var r = new Microsoft.Maps.Location(e, t),
					c = Microsoft.Maps.SpatialMath.getRegularPolygon(r, o, 36,
						Microsoft.Maps.SpatialMath.Meters),
					l = new Microsoft.Maps.Polygon(c, {
						fillColor: void 0 === i.fillColor ? "rgba(255,0,0,0.3)" : i.fillColor,
						strokeThickness: void 0 === i.strokeWidth ? 0 : i.strokeWidth
					});
				a.entities.push(l), "click" !== n && "mousedown" !== n && "mouseout" !==
					n && "mouseover" !== n && "mouseup" !== n || "function" != typeof s ||
					Microsoft.Maps.Events.addHandler(l, n, s);
				var u = new Microsoft.Maps.Pushpin(r, {
					color: void 0 === i.pinColor ? "#ff0000" : i.pinColor
				});
				a.entities.push(u)
			})
		}
	}, {
		key: "setLocationBoundary",
		value: function(e, t, o) {
			var i = this.map,
				a = [],
				n = void 0 !== arguments[3] && 1 == arguments[3];

			function s() {
				for (var e, t = i.getZoom(), o = 0; o < i.layers.length; o++)(e = i.layers[
					o]).metadata && e.metadata.zoomRange && (t >= e.metadata.zoomRange.min &&
					t <= e.metadata.zoomRange.max ? e.setVisible(!0) : e.setVisible(!1))
			}
			Microsoft.Maps.loadModule(["Microsoft.Maps.SpatialDataService",
				"Microsoft.Maps.Search"
			], function() {
				for (var s = new Microsoft.Maps.Search.SearchManager(i), r = 0; r <
					e.length; r++) s.geocode(c(r, t[r]));

				function c(t, s) {
					return {
						where: e[t],
						callback: function(e) {
							if (e && e.results && e.results.length > 0) {
								var r = {
									entityType: o,
									getAllPolygons: n
								};
								Microsoft.Maps.SpatialDataService.GeoDataAPIManager.getBoundary(
									e.results[0].location, r, i,
									function(e) {
										e.results && e.results.length > 0 && (a[t] = new Microsoft.Maps
											.Layer, a[t].metadata = void 0 === s ? {
												zoomRange: {
													min: 1,
													max: 20
												}
											} : {
												zoomRange: {
													min: s[0],
													max: s[1]
												}
											}, a[t].add(e.results[0].Polygons), i.layers.insert(a[t]))
									}, null,
									function(e, t) {
										console.log(e), console.log(t)
									})
							}
						}
					}
				}
			}), Microsoft.Maps.Events.addHandler(i, "viewchangeend", s), s()
		}
	}, {
		key: "heatMap",
		value: function(e) {
			var t = this.map;
			Microsoft.Maps.loadModule(["Microsoft.Maps.GeoJson",
				"Microsoft.Maps.HeatMap"
			], function() {
				Microsoft.Maps.GeoJson.readFromUrl(e, function(e) {
					var o = new Microsoft.Maps.HeatMapLayer(e, {
						radius: 5,
						propertyAsWeight: "mag"
					});
					t.layers.insert(o)
				})
			})
		}
	}, {
		key: "geolocation",
		value: async function(e) {
			e(await this._getGeolocation())
		}
	}, {
		key: "_getGeolocation",
		value: function() {
			return new Promise(function(e) {
				navigator.geolocation.getCurrentPosition(function(t) {
					return console.log(t), e(t)
				})
			})
		}
	}]), Bmap
}();
